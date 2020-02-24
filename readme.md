# McDrink

Bot that solves McDonalds surveys for free drinks using serverless, pupeteer and aws-sdk.


## Installation

1. Clone the repository and install all dependencies with npm.  
2. Rename the secret.example.yml to secrets.yml and put in your credentials

## Usage

Start the serverless-offline server:

```bash
npm start
```

In a new window run one of the following commands to invoke the lambda functions. The payload for the invocations are located in the /resources/dev directory.

```bash
npm run telegram:bot
or
npm run telegram:api
```

## Deployment

Everything pushed onto the master branch is automatically deployed to AWS.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
