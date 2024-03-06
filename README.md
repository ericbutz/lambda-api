# Lambda REST API

## Usage

To deploy this project, run the following commands in your terminal:

```bash
git clone git@github.com:ericbutz/lambda-api.git && cd lambda-api
npm i
npm run deploy
```

You should see output indicating the service was deployed and your endpoints are live:

```bash
✔ Service deployed to stack truss-api-test1-dev
endpoints:
etc...
functions:
etc...
```

## Testing

There are tests to confirm the dyanamodb deployment. Note that these currently run against the "default" aws profile.

```
npm test
```


