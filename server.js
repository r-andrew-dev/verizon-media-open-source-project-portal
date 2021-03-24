const express = require('express')
const path = require('path');
const app = express()
const port = process.env.PORT || 3000

require('dotenv').config();
const axios = require('axios')
const router = require('express').Router();

const key = require('./keys.js')
githubKey = `${key.getKey()}`


const orgList = ['yahoo', 'arkime', 'Verizon', 'VerizonAdPlatforms', 'VerizonDigital', 'VerizonMedia', 'aol', 'bindable-ui', 'bullet-db', 'denali-design', 'flurry', 'millennialmedia', 'screwdriver-cd', 'theparanoids', 'ultrabrew', 'vespa-engine']

let totalRequestCount = orgList.length
let executedRequestCount = 0;
let allRepos = [];
let allIssues = [];
let page = 1;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + '/public'));

// router.get('/test', function(req,res) {
//     console.log('it hits the route')
//     res.json({message: 'hooray! welcome!'})
// }) 

// app.use('/api', routes); 
loadRepos();
hackTogetherIssues();
// hackTogetherIssues();

// load repos.json file and display the list of projects from it - should be re-tooled to do this rather than creating on the fly everytime ß
 function loadRepos() {
    for (let i=0; i < totalRequestCount; i++) {
    getRepos(i)
  }};
  
  async function getRepos(i) {
    let config = {'Authorization': `token ${githubKey}`};
  
    if (`${orgList[i]}` == 'yahoo') {
    await axios.get(`https://api.github.com/orgs/${orgList[i]}/repos?per_page=100&page=2`, {headers: config}).then((res) => {

        let repoArray = Object.values(res.data)

        allRepos = repoArray.concat(allRepos)
 
    }).catch((error) => console.log(error))
    }
   
  await axios.get(`https://api.github.com/orgs/${orgList[i]}/repos?per_page=100&page=1`, {headers: config}).then((res) => {
    let repoArray = Object.values(res.data)
        allRepos = repoArray.concat(allRepos)
        executedRequestCount++;
   
    }).catch((error) => console.log(error))
  
  
  if (totalRequestCount == executedRequestCount) {
      allRepos = allRepos.filter(repo => repo.archived === false);
      allRepos = allRepos.filter(repo => repo.private === false);
      return allRepos  

      } 
  }

  async function hackTogetherIssues() {
    let config = {'Authorization': `token ${githubKey}`};
    await axios.get(`https://api.github.com/search/issues?q=label:HacKTogether&type=issues&page=${page}&per_page=100`, {headers: config}).then((res) => {
     let issueArray = Object.values(res.data.items)
    allIssues = issueArray.concat(allIssues)
      let headers = res.headers.link 
      if (headers.includes('rel="next"')) {
        console.log("Yes, there is another page")
        page ++ 
        hackTogetherIssues()
      } else {
        console.log("we maybe did it?")
        console.log(allIssues.length)
      return allIssues
      }
  })
}

app.get('/allIssues', function (req, res) {
  console.log('hitting issues route')
  res.send(allIssues)
});

  
app.get('/allRepos', function (req, res) {
  console.log('it hits this route')
    res.send(allRepos)
}); 

app.listen(port, () => {
console.log('magic happen on port ' + port);
});
