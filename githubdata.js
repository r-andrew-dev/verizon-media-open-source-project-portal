require('dotenv').config();
const axios = require('axios')
const router = require('express').Router();

const key = require('./keys.js')

githubKey = `${key.getKey()}`

console.log(`Key' : ${key.getKey()}`)


const orgList = ['yahoo', 'arkime', 'Verizon', 'VerizonAdPlatforms', 'VerizonDigital', 'VerizonMedia', 'aol', 'bindable-ui', 'bullet-db', 'denali-design', 'flurry', 'millennialmedia', 'screwdriver-cd', 'theparanoids', 'ultrabrew', 'vespa-engine']
let totalRequestCount = orgList.length
let executedRequestCount = 0;
let repos = []

// load repos.json file and display the list of projects from it - should be re-tooled to do this rather than creating on the fly everytime ß
let loadRepos = () => {
  for (let i=0; i < totalRequestCount; i++) {
  getRepos(i)
  console.log("running again")
}};

function getRepos(i) {
  let config = {'Authorization': `token ${githubKey}`};
if (`${orgList[i]}` == 'yahoo') {
  console.log('making it here')
  axios.get(`https://api.github.com/orgs/${orgList[i]}/repos?per_page=100&page=2`, {headers: config}).then((resp) => {
      console.log(resp)
      repos = repos.concat(resp)
  }).catch((error) => console.log(error))
  }
 
axios.get(`https://api.github.com/orgs/${orgList[i]}/repos?per_page=100&page=1`, {headers: config}).then((resp) => {
      console.log(resp)
      repos = repos.concat(resp)      
      executedRequestCount++;
  }).catch((error) => console.log(error))


if (totalRequestCount == executedRequestCount) {
      console.log('making it here');
      console.log("here are the repos " + repos.length)
      repos.pop();
      repos = repos.filter(repo => repo.archived === false);      
      return repos  
    } 
}

console.log(repos)

