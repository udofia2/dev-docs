import * as React from 'react';
import {getUserClaims,getIdPJwt} from '@redocly/developer-portal/ui'

interface Api {
  name: string;
  shortDescription: string;
  longDescription: string;
  policyId: string;
}

interface Developer {
  id: string;
  email: string;
  subscriptions: Record<string, boolean>;
}

const apiUrlBase = "https://agreed-zootsuit-mgw.aws-use1.cloud-ara.tyk.io/tykadmin"
const apiKey = "eyJvcmciOiI2MjU5OGI0MTgyZGJlZjAwMDFlZmY5MzMiLCJpZCI6ImM4YThkNGNjZjljNDQ0MDViMzQyYTliNmQ0MzRmOWEwIiwiaCI6Im11cm11cjEyOCJ9"
const headers = {"Authorization": apiKey};

async function getJson(path: string) {
  const resp = await fetch(apiUrlBase + path, {headers});
  const json = await resp.json();
  return {resp, json};
}

async function postJson(path: string, body: any) {
  return fetch(apiUrlBase + path, {headers, body, method: 'post'});
}

export async function Dashboard() {
  const redoclyAccount = getUserClaims();
  const redoclyAccountJWT = getIdPJwt();
  const devEmail = redoclyAccount.email;

  //const [developer, setDeveloper] = React.useState({} as Developer)
  let developer = {} as Developer;
  const hits = 0;

  if (devEmail) {
    const {resp, json} = await getJson(`/developers/email/${devEmail}`);

    if (resp.status === 200) {
      //setDeveloper(json);
      developer = json as Developer
    } else {
      const developerSignup = {
        "email": devEmail,
        "password": "temppassfixme",
        "inactive": false,
        "fields": {
            "claims": JSON.stringify(redoclyAccount),
        }
      }
      const resp = await postJson(`/developers/`, developerSignup);

      if (resp.status === 200) {
        const {resp, json} = await getJson(`/developers/email/${devEmail}`);
        //setDeveloper(json);
        developer = json as Developer
      } else {
        return <div>Failed to create account!</div>
      }
    }
  } else {
    return <div>Not authorized!</div>
  }

  const {json: apisCatalogue} = await getJson("/catalogue");
  const {json: portalConfig} = await getJson("/configuration");
  
  async function requestAccess(policyId: string) {
    const key_request = {
      "by_user": developer.id,
      "fields": { // for custom fields
      },
      'date_created': (new Date()).toDateString(),
      "version": "v2",
      "for_plan": policyId,
    }
    const resp = await postJson('/requests', key_request);
    if (resp.status == 200) {
      alert('Requested access succesfully')
    } else {
      alert('Failed to request access')
    }
  }

  function getApps() {
    let rows = []
    for (const api of apisCatalogue.apis) {
      rows.push(
      <div>
        <h2>{api.name}</h2>
        <h3>{api.shortDescription}</h3>
        <p>{api.longDescription}</p>
        {
          developer.subscriptions[api.policy_id] ? 
            <h4>Already subscribed</h4> : 
            <button onClick={() => requestAccess(api.policy_id)}>Request access</button>
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
