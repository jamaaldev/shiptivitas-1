import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const ShipTivitasKanbanApi = createApi({
    reducerPath: 'ShipTivitasKanbanApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001/api/v1/' }),
    endpoints: (builder) => ({
      getShipTivitasKanban: builder.query({
        query: (getQuery) => `clients/${getQuery}`,
      }),
    }),
  })


  // Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetShipTivitasKanbanQuery } = ShipTivitasKanbanApi