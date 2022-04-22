import * as React from 'react';
import {getUserClaims,getIdPJwt} from '@redocly/developer-portal/ui'

interface Api {
  name: string;
  shortDescription: string;
  longDescription: string;
  policyId: string;
}

interface Developer {
  subscriptions: Record<string, boolean>;
}

const apiUrlBase = "https://agreed-zootsuit-mgw.aws-use1.cloud-ara.tyk.io"
const apiKey = "acc12c0e8e184a824fe578dc6d0f629d"
const headers = {"Authorization": apiKey};

async function getJson(path: string) {
  const resp = await fetch(apiUrlBase + path, {headers});
  const json = await resp.json();
  return {resp, json};
}

export async function Dashboard() {
  const redoclyAccount = getUserClaims();
  const redoclyAccountJWT = getIdPJwt();
  const devEmail = redoclyAccount.email;

  //const [developer, setDeveloper] = React.useState({} as Developer)
  let developer = {} as Developer;
  const hits = 0;

  if (devEmail) {
    const {resp, json} = await getJson(`/api/portal/developers/email/${devEmail}`);

    if (resp.status === 200) {
      //setDeveloper(json);
      developer = json as Developer
    } else {
      //register developer
    }
  } else {
    return <div>Not authorized!</div>
  }

  const {json: apisCatalogue} = await getJson("/api/portal/catalogue");
  const {json: portalConfig} = await getJson("/api/portal/configuration");

  function getApps() {
    let rows = []
    for (const api of apisCatalogue) {
      rows.push(
      <div>
        <h2>{api.name}</h2>
        <h3>{api.shortDescription}</h3>
        <p>{api.longDescription}</p>
        {
          developer.subscriptions[api.policyId] ? 
            <h4>Already subscribed</h4> : 
            <a href='/request/'>Request access</a>
        }
        <hr/>
      </div>);
    }
  }

  return (   
    <div>
      <h3>Analytics</h3>
      For the last 30 days you made: <strong>{hits}</strong> requests
      <h3>APIs:</h3>
      {getApps()}
    </div>
  );
}
