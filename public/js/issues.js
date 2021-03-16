// globals
window._globals = {
    allRepos: undefined,
    sortFilterSearchRepos: undefined,
    ignoreNextHashChange: undefined
  };

  let openIssues = []
  let closedIssues = []

  const orgList = ["arkime", "AthenZ", "denali-design", "yahoo", "screwdriver-cd", "vespa-engine", "VerizonDigital", "yavin-dev"]

  $.get('/allIssues', (data, status) => {
    data.map((issue) => {
    let repoURL = issue.repository_url
    let splitURL = repoURL.split('/');

    let org = splitURL[splitURL.length - 2]
    
    if (orgList.includes(org) && issue.state === "open") {
        openIssues.push(issue)
      } else if (orgList.includes(org) && issue.state === "closed") {
        closedIssues.push(issue)
      } else { 
        return
      }
    })


    $("#count").text(openIssues.length ? openIssues.length : 0);
    $("#count-closed").text(closedIssues.length ? closedIssues.length : 0);
    window._globals.allRepos = openIssues
    updateUI();
    fillProjectFilter();
  });

$("select#sort").on("change", function () {
  sortLanguage(this.value);
});

$("select#filter").on("change", function () {
  filter(this.value);
});

$("select#sortType").on("change", function() {
  typeSort(this.value)
})

$("select#sortLabel").on("change", function() {
  filterByLabel(this.value)
})

$("input#search").on("keyup", function () {
  search(this.value);
});

$("input#display").on("change", function () {
  display(this.checked ? "card" : "list");
});

// register events for updating the UI state based on the hash
window.addEventListener("hashchange", updateUI);

// creates a readable project name from the (technical) GitHub repository name
function readableRepoName(sName) {
  // split by - by default
  let aWords = sName.split("-");
  // try splitting with _ instead
  if (aWords.length === 1) {
    aWords = sName.split("_");
  }
  // uppercase words
  aWords = aWords.map(
    (sWord) => sWord.charAt(0).toUpperCase() + sWord.slice(1)
  );
  // replace minus with space
  return aWords.join(" ");
}

// creates all items to be displayed
function createContent(aItems) {
  // extract display mode
  let oURL = new URL("https://dummy.com");
  oURL.search = window.location.hash.substring(1);
  const sDisplay = oURL.searchParams.get("display") || "card";
  // generate and show HTML
  const sResult = aItems.map((oItem) => generateItem(sDisplay, oItem));
  updateContent(sDisplay, sResult);
}

// updates the content area
function updateContent(sDisplay, sResult) {
  // flush html
  $("#" + (sDisplay === "card" ? "card" : "row") + "s").html(sResult);
  // update result count in search placeholder
  $("#search + label").text(`Search issues...`);
  // replace broken images with a meaningful default image
  // side-note: tools.sap requires login to display avatars
  $("img").on("error", function () {
    Math.seedrandom($(this).attr("src"));
    $(this).attr(
        "src",
        "images/default" + (Math.floor(Math.random() * 3) + 1) + ".png"
    );
    Math.seedrandom();
  });

  $(".tooltipped").tooltip(); //initialise tooltips
}

// updates UI state based on Hash
function updateUI() {
  if (window._globals.ignoreNextHashChange) {
    return;
  }
  window._globals.sortFilterSearchRepos = window._globals.allRepos;
  let oURL = new URL("https://dummy.com");
  oURL.search = window.location.hash.substring(1);
  // apply filters
  oURL.searchParams.get("sort") && sortLanguage(oURL.searchParams.get("sort"));
  oURL.searchParams.get("filter") && filter(oURL.searchParams.get("filter"));
  oURL.searchParams.get("search") && search(oURL.searchParams.get("search"));
  oURL.searchParams.get("sortType") && typeSort(oURL.searchParams.get("sortType"));
  oURL.searchParams.get("sortLabel") && filterByLabel(oURL.searchParams.get("sortLabel"));
  // open details dialog
  oURL.searchParams.get("details") && showModal(parseInt(oURL.searchParams.get("details")) || oURL.searchParams.get("details"));
  // set display mode
  display(oURL.searchParams.get("display") || "card");
}

// updates hash based on UI state (note: does not work on IE11, needs URL Polyfill)
function updateHash(sKey, sValue) {
  let oURL = new URL("https://dummy.com");
  oURL.search = window.location.hash.substring(1);
  sValue ? oURL.searchParams.set(sKey, sValue) : oURL.searchParams.delete(sKey);
  window._globals.ignoreNextHashChange = true;
  window.location.hash = oURL.searchParams.toString().replace("%21=", "!");
  // ignore hash change events for the next second to avoid redundant content update
  setTimeout(function () {
    window._globals.ignoreNextHashChange = false;
  }, 1000);
}

// helper function to display each language in a different static colour
function stringToColour(sString) {
  Math.seedrandom(sString);
  const rand = Math.random() * Math.pow(255,3);
  Math.seedrandom();

  let colour = "#";
  for (let i = 0; i < 3; colour += ("00" + ((rand >> i++ * 8) & 0xFF).toString(16)).slice(-2));
  return colour;
}

// fills the HTML template for a project item
function generateItem (sDisplay, oRepo) {
  // console.log(Object.entries(oRepo))
  let sHTML;
  if (sDisplay === "list") {
    sHTML = window.document.getElementById("row-template").getElementsByTagName("tr")[0].outerHTML;
  } else {
    sHTML = window.document.getElementById(sDisplay + "-template").innerHTML;
  }

  sHTML = sHTML.replace("[[id]]", typeof oRepo.id === "string" ? "'" + oRepo.id + "'" : oRepo.id);

  // let sLogoURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.logo
  //     ? oRepo._InnerSourceMetadata.logo.startsWith("http") || oRepo._InnerSourceMetadata.logo.startsWith("./")
  //         ? oRepo._InnerSourceMetadata.logo
  //         : "data/" + oRepo._InnerSourceMetadata.logo + (oRepo._InnerSourceMetadata.logo.split("\.").pop() === "svg" ? "?sanitize=true" : "")
  //     : oRepo.owner.avatar_url;
  // sHTML = sHTML.replace("[[mediaURL]]", sLogoURL);

  let sTitle = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.title
      ? oRepo._InnerSourceMetadata.title
      : readableRepoName(oRepo.title);
  sHTML = sHTML.replace("[[title]]", sTitle);

  sHTML = sHTML.replace("[[issueURL]]", oRepo.html_url);
  
  let repoURL = oRepo.repository_url
  let splitURL = repoURL.split('/');

  if (splitURL[splitURL.length - 2] === "yahoo") {
    let project = splitURL[splitURL.length - 1]
    sHTML = sHTML.replace("[[repoTitle]]", project);
    if (project === "elide") {
      sHTML = sHTML.replace("[[status]]", "Java")
      sHTML = sHTML.replace("[[type]]", "Data")
    } else if (project === "Oak") {
      sHTML = sHTML.replace("[[status]]", "Java, Python")
      sHTML = sHTML.replace("[[type]]", "Data")
    } else if (project.inlcudes("k8s")) {
      sHTML = sHTML.replace("[[status]]", "Go")
      sHTML = sHTML.replace("[[type]]", "Dev Ops")
    } else {}

  } else if (splitURL[splitURL.length - 2] === "VerizonDigital") {
    let project = splitURL[splitURL.length - 1]
    sHTML = sHTML.replace("[[repoTitle]]", project);
    sHTML = sHTML.replace("[[status]]", "C++, C");
    sHTML = sHTML.replace("[[type]]", "Dev Ops")
  } else {
    let project = splitURL[splitURL.length - 2]
    sHTML = sHTML.replace("[[repoTitle]]", project);
    if (project === "arkime") {
      sHTML = sHTML.replace("[[status]]", "Javascript, C, Vue, Perl, HTML")
      sHTML = sHTML.replace("[[type]]", "Security")
    } else if (project === "AthenZ") {
      sHTML = sHTML.replace("[[status]]", "Java, Javascript, Go")
      sHTML = sHTML.replace("[[type]]", "Security")
    } else if (project === "denali-design") {
      sHTML = sHTML.replace("[[status]]", "Javascript, CSS, SCSS")
      sHTML = sHTML.replace("[[type]]", "Design")
    } else if (project === "screwdriver-cd") {
      sHTML = sHTML.replace("[[status]]", "Javascript, Go, Ruby")
      sHTML = sHTML.replace("[[type]]", "Dev Ops")
    } else if (project === "vespa-engine") {
      sHTML = sHTML.replace("[[status]]", "Java, C++, Javascript")
      sHTML = sHTML.replace("[[type]]", "Data")
    } else if (project === "yavin-dev") {
      sHTML = sHTML.replace("[[status]]", "Javascript, Typescript")
      sHTML = sHTML.replace("[[type]]", "Data")
    } else {}
  }

  let labels = oRepo.labels
  let labelList = [];

  for (let i=0; i < labels.length; i++) {
    labelList.push(labels[i].name)
  }

  let index = labelList.indexOf("HackTogether")
  if (index > -1) {labelList.splice(index, 1)}
  let labelString = labelList.join(", ")

  sHTML = sHTML.replace("[[labels]]", labelString)


  // sHTML = sHTML.replace("[[status]]", oRepo.state.toUpperCase())

  let sDescription = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.motivation
      ? oRepo._InnerSourceMetadata.motivation
      : oRepo.body !== null
          ? oRepo.body
          : "";
  sHTML = sHTML.replace("[[description]]", sDescription);

  // sHTML = sHTML.replace("[[stars]]", oRepo.stargazers_count);
  // sHTML = sHTML.replace("[[issues]]", oRepo.open_issues_count);
  // sHTML = sHTML.replace("[[forks]]", oRepo.forks_count);

  // let iScore = oRepo._InnerSourceMetadata &&
  //     typeof oRepo._InnerSourceMetadata.score === "number" &&
  //     getActivityLogo(oRepo._InnerSourceMetadata.score);
  // sHTML = sHTML.replace("[[score]]", iScore);

  // sHTML = sHTML.replace("[[language]]", getRepoLanguage(oRepo.language));

  let sContributeURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs
      ? oRepo._InnerSourceMetadata.docs
      : oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.guidelines
          ? `${oRepo.html_url}/blob/${oRepo.default_branch}/${oRepo._InnerSourceMetadata.guidelines}`
          : oRepo.html_url;
  sHTML = sHTML.replace("[[contributeURL]]", sContributeURL);

  return $(sHTML);
}

// fill project filter list based on detected projects
function fillProjectFilter () {
  let aAllProjects = [];
  window._globals.allRepos.map(repo => {

    let repoURL = repo.repository_url
    let splitURL = repoURL.split('/');
    
    let org = splitURL[splitURL.length - 2];
    let vzOrgRepo = splitURL[splitURL.length - 1]


    if (org !== "yahoo" && org !== "VerizonDigital" && !aAllProjects.includes(org)) {
      aAllProjects.push(org)
    }


    else if (org === "yahoo" && !aAllProjects.includes(vzOrgRepo)) {

      aAllProjects.push(vzOrgRepo)

    } else if (org === "VerizonDigital" && !aAllProjects.includes(vzOrgRepo)) {
      
      aAllProjects.push(vzOrgRepo)
    
    } else { console.log("we already have this project") }

  });
  // sort alphabetically and reverse
  aAllProjects = aAllProjects.sort().reverse();
  // insert new items backwards between "All" and "Other"
  let oFilter = window.document.getElementById("filter");
  aAllProjects.forEach(project => {
    let oOption = window.document.createElement("option");
    oOption.text = oOption.value = project;
    oFilter.add(oOption, 1);
  });
  // initialize all filters
  $("select").formSelect();
  // addLanguageIconsToFilter();
}

function filterByLabel (sParam) {
  let aAllLabels = [];
  let aResult = [];

  if (sParam !== "All") {
  window._globals.allRepos.map(repo => {

    let labels = repo.labels
  
    for (let i=0; i < labels.length; i++) {
      if (!aAllLabels.includes(labels[i].name) && labels[i].name !== "HackTogether")
      aAllLabels.push(labels[i].name)
      console.log(aAllLabels)
    }

    if (aAllLabels.includes(sParam)) {
      aResult.push(repo)
      aAllLabels = [];
    }
  });
  } else {
    aResult = window._globals.allRepos
  }

  createContent(aResult);
  window._globals.sortFilterSearchRepos = aResult;
  // update hash
  updateHash("search", undefined);
  updateHash("sort", undefined);
  updateHash("filter", undefined);
  updateHash("sortType", undefined)
  updateHash('sortLabel', sParam)
  // update select
  let oSelect = window.document.getElementById("sortLabel");
  for (let i = 0; i < oSelect.options.length; i++) {
    if (oSelect.options[i].value === sParam) {
      oSelect.selectedIndex = i;
    }
  }
  M.FormSelect.init(oSelect);

  // reset search
  window.document.getElementById("search").value = "";
  let language = window.document.getElementById("sort");
  language.selectedIndex = 0;
  M.FormSelect.init(language);
  let type = window.document.getElementById("sortType")
  type.selectedIndex = 0;
  M.FormSelect.init(type)
  let filter = window.document.getElementById("filter")
  filter.selectedIndex = 0;
  M.FormSelect.init(filter)
  };

// sneak in language icons
// function addLanguageIconsToFilter() {
//   $("#filter").siblings("ul").find("li").each((iIndex, oItem) => {
//     if ($(oItem).text() !== "All" && $(oItem).text() !== "Other") {
//       $(oItem).html(getRepoLanguage($(oItem).text()) + $(oItem).html());
//     }
//   });
// }

// sort the cards by chosen parameter (additive, combines filter or search)
// function sort(sParam) {
//   let aResult;
//   if (["issue-name", "issue-description"].includes(sParam)) {
//     // sort alphabetically
//     aResult = window._globals.sortFilterSearchRepos.sort((a, b) => (b[sParam] < a[sParam] ? 1 : -1));
//   } else if (sParam === "status") {
//     // sort by InnerSource score
//     aResult = closedIssues
//     console.log(sParam)
//   } else {
//     // sort numerically
//     aResult = window._globals.sortFilterSearchRepos.sort((a, b) => b[sParam] - a[sParam]);
//   }
//   createContent(aResult);
//   // update hash
//   updateHash("sort", sParam)
//   updateHash("filter", undefined);
//   // update select
//   let oSelect = window.document.getElementById("sort");
//   for (let i = 0; i < oSelect.options.length; i++) {
//     if (oSelect.options[i].value === sParam) {
//       oSelect.selectedIndex = i;
//     }
//   }
//   M.FormSelect.init(oSelect);
// }

// filter the cards by chosen parameter (resets search)
function filter(sParam) {
  let aResult = [];
  window._globals.allRepos.map(repo => {

    let repoURL = repo.repository_url
    let splitURL = repoURL.split('/');
    
    let org = splitURL[splitURL.length - 2];
    let vzOrgRepo = splitURL[splitURL.length - 1]
  
  if (sParam !== "All") {
    
    if (sParam === vzOrgRepo) {
      
      aResult.push(repo)

    } else if (org !== "yahoo" && org !== "VerizonDigital" && sParam === org) {
      
      aResult.push(repo) 
    } 

  } else {

    aResult = window._globals.allRepos

  }

  });
        
  createContent(aResult);
  window._globals.sortFilterSearchRepos = aResult;
  // update hash
  updateHash("search", undefined);
  updateHash("filter", sParam);
  // update select
  let oSelect = window.document.getElementById("filter");
  for (let i = 0; i < oSelect.options.length; i++) {
    if (oSelect.options[i].value === sParam) {
      oSelect.selectedIndex = i;
    }
  }
  M.FormSelect.init(oSelect);
  // addLanguageIconsToFilter();
  // reset search
  window.document.getElementById("search").value = "";
  let language = window.document.getElementById("sort");
  language.selectedIndex = 0;
  M.FormSelect.init(language);
  let type = window.document.getElementById("sortType")
  type.selectedIndex = 0;
  M.FormSelect.init(type)
  let label = window.document.getElementById("sortLabel")
  label.selectedIndex = 0;
  M.FormSelect.init(label)
}

function sortLanguage(sParam) {
  
  let aResult = [];
  let languages; 
  
  window._globals.allRepos.map(oRepo => {
  let repoURL = oRepo.repository_url
  let splitURL = repoURL.split('/');

  if (splitURL[splitURL.length - 2] === "yahoo") {
    let project = splitURL[splitURL.length - 1]
    if (project === "elide") {
      languages = ["Java"]
    } else if (project === "Oak") {
     languages = ["Java", "Python"]
    } else if (project.inlcudes("k8s")) {
      languages = ["Go"]
    } else {}

  } else if (splitURL[splitURL.length - 2] === "VerizonDigital") {
    languages = ["C++", "C"]
  } else {
    let project = splitURL[splitURL.length - 2]
    if (project === "arkime") {
      languages =  ["Javascript", "C", "Vue", "Perl", "HTML"]
    } else if (project === "AthenZ") {
      languages = ["Java", "Javascript", "Go"]
    } else if (project === "denali-design") {
      languages =  ["Javascript", "CSS", "SCSS"]
    } else if (project === "screwdriver-cd") {
      languages =  ["Javascript", "Go", "Ruby"]
    } else if (project === "vespa-engine") {
      languages = ["Java", "C++", "Javascript"]
    } else if (project === "yavin-dev") {
      languages = ["Javascript", "Typescript"]
    } else {}
  }

  if (sParam !== "All") {
  if (languages.includes(sParam)) {
    aResult.push(oRepo)
  } else {
    console.log("this is where we are")
  } 
} else { aResult = window._globals.allRepos

  }

});
        
  createContent(aResult);
  window._globals.sortFilterSearchRepos = aResult;
  // update hash
  updateHash("sort", sParam)
  updateHash("filter", "All");
  // update select
  let oSelect = window.document.getElementById("sort");
  for (let i = 0; i < oSelect.options.length; i++) {
    if (oSelect.options[i].value === sParam) {
      oSelect.selectedIndex = i;
    }
  }
  M.FormSelect.init(oSelect);
  // addLanguageIconsToFilter();
  // reset search
  window.document.getElementById("search").value = "";
  let project = window.document.getElementById("filter");
  project.selectedIndex = 0;
  M.FormSelect.init(project);
  let type = window.document.getElementById("sortType");
  type.selectedIndex = 0;
  M.FormSelect.init(type);
  let label = window.document.getElementById("sortLabel");
  label.selectedIndex = 0;
  M.FormSelect.init(label);
}

function typeSort(sParam) {
  
  let aResult = [];
  let type; 
  
  window._globals.allRepos.map(oRepo => {
  let repoURL = oRepo.repository_url
  let splitURL = repoURL.split('/');

  if (splitURL[splitURL.length - 2] === "yahoo") {
    let project = splitURL[splitURL.length - 1]
    if (project === "elide") {
      type = ["Data"]
    } else if (project === "Oak") {
     type = ["Data"]
    } else if (project.inlcudes("k8s")) {
      type = ["Dev Ops"]
    } else {}

  } else if (splitURL[splitURL.length - 2] === "VerizonDigital") {
    type = ["Dev Ops"]
  } else {
    let project = splitURL[splitURL.length - 2]
    if (project === "arkime") {
      type =  ["Security"]
    } else if (project === "AthenZ") {
      type = ["Security"]
    } else if (project === "denali-design") {
      type =  ["Design"]
    } else if (project === "screwdriver-cd") {
      type =  ["Dev Ops"]
    } else if (project === "vespa-engine") {
      type = ["Data"]
    } else if (project === "yavin-dev") {
      type = ["Data"]
    } else {}
  }

  if (sParam !== "All") {
  if (type.includes(sParam)) {
    aResult.push(oRepo)
  } else {
    console.log("this is where we are")
  } 
} else { aResult = window._globals.allRepos

  }

});

        
  createContent(aResult);
  window._globals.sortFilterSearchRepos = aResult;
  // update hash
  updateHash("sortType", sParam)
  updateHash("sort", undefined)
  updateHash("filter", undefined);

  // update select
  let oSelect = window.document.getElementById("sortType");
  for (let i = 0; i < oSelect.options.length; i++) {
    if (oSelect.options[i].value === sParam) {
      oSelect.selectedIndex = i;
    }
  }
  M.FormSelect.init(oSelect);
  // addLanguageIconsToFilter();
  // reset search
  window.document.getElementById("search").value = "";
  const oSelected = window.document.getElementById("filter");
  oSelected.selectedIndex = 0;
  M.FormSelect.init(oSelected);
  let language = window.document.getElementById("sort");
  language.selectedIndex = 0;
  M.FormSelect.init(language);
  let label = window.document.getElementById("sortLabel");
  label.selectedIndex = 0;
  M.FormSelect.init(label);
}

// search the cards by chosen parameter (resets filter)
function search(sParam) {
  let sLowerCaseParam = sParam.toLowerCase();
  let oResult = window._globals.allRepos.filter(
    (repo) =>
      // name
      repo.title.toLowerCase().includes(sLowerCaseParam) ||
      // description
      (repo.body && repo.body.toLowerCase().includes(sLowerCaseParam)) ||
      // InnerSource metadata
      (repo._InnerSourceMetadata &&
        (
          repo._InnerSourceMetadata.title &&
          repo._InnerSourceMetadata.title.toLowerCase().includes(sLowerCaseParam) ||
          repo._InnerSourceMetadata.motivation &&
          repo._InnerSourceMetadata.motivation.toLowerCase().includes(sLowerCaseParam) ||
          repo._InnerSourceMetadata.skills &&
          repo._InnerSourceMetadata.skills.join(" ").toLowerCase().includes(sLowerCaseParam) ||
          repo._InnerSourceMetadata.contributions &&
          repo._InnerSourceMetadata.contributions.join(" ").toLowerCase().includes(sLowerCaseParam)
        )
      )
  );
  window._globals.sortFilterSearchRepos = oResult;
  createContent(oResult);

  // update hash
  updateHash("search", sParam);
  updateHash("filter", undefined);
  // set search
  const oSearch = window.document.getElementById("search");
  oSearch.value = sParam;
  M.updateTextFields();
  // reset filter
  const oSelect = window.document.getElementById("filter");
  oSelect.selectedIndex = 0;
  M.FormSelect.init(oSelect);
  const language = window.document.getElementById("sort");
  language.selectedIndex = 0;
  M.FormSelect.init(language);
  const type = window.document.getElementById("sortType");
  type.selectedIndex = 0;
  M.FormSelect.init(type);
}

// toggles the display between card and table view
function display(sParam) {
  // update UI
  window.document.getElementById("display").checked = (sParam !== "list");
  // toggle active icon
  window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 1 : 0].classList.add("active");
  window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 0 : 1].classList.remove("active");
  // only create content when mode has changed
  if (!$("#" + (sParam !== "list" ? "cards" : "rows")).html()) {
    // store context
    updateHash("display", sParam);
    // create content
    createContent(window._globals.sortFilterSearchRepos);
  }
  // toggle content
  $("#" + (sParam !== "list" ? "rows" : "cards")).html("");
  $("#" + (sParam !== "list" ? "cards" : "list")).css("display", "block");
  $("#" + (sParam !== "list" ? "list" : "cards")).attr("style", "display: none !important");
}