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


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + '/public'));

// router.get('/test', function(req,res) {
//     console.log('it hits the route')
//     res.json({message: 'hooray! welcome!'})
// }) 

// app.use('/api', routes);

loadRepos();

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

        console.log(allRepos.length)
 
    }).catch((error) => console.log(error))
    }
   
  await axios.get(`https://api.github.com/orgs/${orgList[i]}/repos?per_page=100&page=1`, {headers: config}).then((res) => {
    let repoArray = Object.values(res.data)
        allRepos = repoArray.concat(allRepos)
        console.log(allRepos.length)  
        executedRequestCount++;
   
    }).catch((error) => console.log(error))
  
  
  if (totalRequestCount == executedRequestCount) {
      console.log("making it here MOM")
      console.log(allRepos[allRepos.length - 1])
      allRepos = allRepos.filter(repo => repo.archived === false); 
      console.log(allRepos.length); 
      return allRepos  

      } 
  }
  
app.get('/allRepos', function (req, res) {
  console.log('it hits this route')
    res.send(allRepos)
})
app.listen(port, () => {
console.log('magic happen on port ' + port);
});
