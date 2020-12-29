require('dotenv').config(); 

const fs = require('fs');
const axios = require('axios');

const githubKey = process.env.GITHUB_KEY

$(window.document).ready(() => {
    $.ajax({
      url: `https://api.github.com/orgs/VerizonMedia?archived:false/repos`,
      method: `GET`,
      success: (oData) => {
        window._globals.allRepos = oData;
        fillLanguageFilter();
        updateUI();
        // show number of projects in header
        $("#count").text(oData.length);

// const findings: any = {
//     repos: {},
//     code: {},
// }

// async function sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve,ms));
// }

// async function getRateLimit() {
//     return axios.get("https://api.github.com/rate_limit", {
//       headers: {
//         Authorization: `token ${githubKey}`,
//       },
//     });
//   }

//   async function searchCode(codeStr: string, org? : string): Promise


apiUrl = 'https://api.github.com/orgs/aol/repos' //API orgs list
orgList = ['Verizon', 'VerizonAdPlatforms', 'VerizonDigital', 'VerizonMedia', 'aol', 'bindable-ui', 'bullet-db', 'denali-design', 'flurry', 'millennialmedia', 'screwdriver-cd', 'theparanoids', 'ultrabrew', 'vespa-engine', 'yahoo']

async function getRespositoryList() {
    
     return axios.get('https://api.github.com/orgs/VerizonMedia/repos', {
         headers: {
             Authorization: `token ${githubKey}`
         }
     }
         function(response) {
             let data = response.data
             console.log(data)
         }

     )

}

getRespositoryList()