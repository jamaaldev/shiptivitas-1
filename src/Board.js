import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.getClients = this.getClients.bind(this);
    this.setState = this.setState.bind(this);
    this.state = {
      clients: {
        backlog: [],
        inProgress:[],
        complete:[],
      }
    }
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    }
  }
 async getClients() {
    const clients = await fetch("http://localhost:3001/api/v1/clients").then(res => res.json())
    const cls =
      clients.sort((a,b) =>  a.priority - b.priority ).map(companyDetails => ({
      id: companyDetails["id"],
      name: companyDetails["name"],
      description: companyDetails["description"],
      status: companyDetails["status"],
      priority: companyDetails["priority"],
    }));
    console.log(cls)
    this.setState ({
      clients: {
        backlog: cls.filter(client => !client.status || client.status === 'backlog'),
        inProgress: cls.filter(client => client.status && client.status === 'in-progress'),
        complete: cls.filter(client => client.status && client.status === 'complete'),
      }
    })
  }

// async getClients() {
//   const clients = await fetch('http://localhost:3001/api/v1/clients')
//   .then(response => response.json())
  
//    this.setState ({
//    clients: {
//     backlog: clients.filter(client => !client.status || client.status === 'backlog'),
//     inProgress: clients.filter(client => client.status && client.status === 'in-progress'),
//     complete: clients.filter(client => client.status && client.status === 'complete'),
//   }
// })
// };
  renderSwimlane(name, clients, ref) {

    return (
      <Swimlane name={name} clients={clients} dragulaRef={ref}/>
    );
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount(){
    this.getClients()
    this.drake = Dragula([this.swimlanes.backlog.current,this.swimlanes.inProgress.current,this.swimlanes.complete.current]);
    this.drake.on('drop',(el,target,source,sibling) => this.updateClient(el,target,source,sibling));
  }
  // clean listener
  componentWillUnmount(){
    this.drake.remove();
  }

  updateClient(el,target,_,sibling){
    this.drake.cancel(true);

    // ref of target swinlanes droped Card element
    let targetSwimlane = "backlog";
    if(target === this.swimlanes.inProgress.current){
      targetSwimlane = "in-progress"
    } else if(target === this.swimlanes.complete.current){
      targetSwimlane = "complete"
    }
    
    // create new array list
    const clientList = [
      ...this.state.clients.backlog,
      ...this.state.clients.inProgress,
      ...this.state.clients.complete,
    ];
    
    const clientThatMoved = clientList.find(client => el && client.id === Number(el.dataset.id));

    const clientThatMovedClone = {
      ...clientThatMoved,
      status:targetSwimlane,
    }

    // remove the one element from orginal place return new list if moved
    const updatedClient = clientList.filter(client => client.id !== clientThatMoved.id);

    // get the index of the element sibling position dropped
    const index = updatedClient.findIndex(client => sibling && client.id === Number(sibling.dataset.id));

  const clientThatMovedCloned = {
    ...clientThatMovedClone,
    priority: sibling ? sibling.dataset.priority : updatedClient.length + 1,
   }
    // update the list by order 
    updatedClient.splice(index === -1 ? updatedClient.length : index , 0 , clientThatMovedCloned);

    // updated List state to effect the change in DOM
    this.setState({
      clients:{
        backlog:updatedClient.filter(client => !client.status || client.status === "backlog"),
        inProgress:updatedClient.filter(client => client.status && client.status === "in-progress"),
        complete:updatedClient.filter(client => client.status && client.status === "complete"),
      }
    });
    fetch(`http://localhost:3001/api/v1/clients/${el.dataset.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientThatMovedCloned),
    }).then(() => {
      // this.getClients();
    });
  }
}
