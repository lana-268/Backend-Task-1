# Session 2 implementation plan

- [ ] Inspect the existing architecture, domain types, stores, middleware, and checks.
- [ ] Add the bookings resource through routes, controller, and service layers.
- [ ] Validate booking creation with a strict request-body schema.
- [ ] Enforce the duplicate booking rule for every booking status.
- [ ] Enforce capacity using confirmed bookings only.
- [ ] Add retrieval of an individual booking.
- [ ] Add cancellation that retains the booking record.
- [ ] Add event pagination with page, limit, and response metadata.
- [ ] Add exact venue filtering for events.
- [ ] Add inclusive from/to event date filtering.
- [ ] Apply event filtering before calculating totals and paginating.
- [ ] Validate all bodies, parameters, and query strings with shared middleware.
- [ ] Complete the API consistency and centralized error-handling pass.
- [ ] Test booking and event API cases manually and with configured checks.
- [ ] Verify the final architecture and error-response constraints.
- [ ] Update this checklist and commit the completed implementation.
