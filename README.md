# Kiwi Nurse Web App

## Run locally
npm install  
npm run dev  

Test credentials:  
nurse1@kiwi.test / kiwi1234

## Assumptions
- `lastSeen` values are epoch seconds
- Latest vitals are under `lastVitals`
- Vitals may be missing or inconsistently typed
- Data is normalized client-side before rendering

## Tradeoffs
- Client-side normalization used to handle inconsistent API schemas

## Improvements
- Token refresh on 401
- Shared layout components
- Persist UI preferences
