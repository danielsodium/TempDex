const $ = require('jquery');
var https = require('follow-redirects').https;
onPlayer = false;
const path = (electron.app || electron.remote.app).getPath('userData')+"/AppStorage"

module.exports = { replaceText, toggleNav, loadSettings, loadHome, loadLibrary, loadSearch };


function loadSettings() {
    if (onPlayer) exitPlay();

    $("#main").empty();
    $("#main").load("settings.html", function() {
        document.getElementById("toggleDev").checked = settings.devMode;
        document.getElementById("toggleExternal").checked = settings.openExternal;
        document.getElementById("scrape").value = settings.scrape;
        document.getElementById("mode").appendChild(document.createTextNode(remote.getGlobal( "allAnime" ).length == 0 ? "offline" : "online"))
    })
}


function loadHome() {
    if (onPlayer) exitPlay();
    $("#main").empty();
    $("#main").load("home.html", function() {
        if (settings.devMode != undefined && !settings.devMode) {

            fs.readFile(path+"/data.json", 'utf8' , (err, data) => {
                data = JSON.parse(data)
                if (data.recent.length == 0) {
                    document.getElementById("recent-title").style.display = "none";
                } else {
                    // Making the recently played buttons
                    for (var i = 0; i < Math.min(data.recent.length, 3); i++) (function(i) {
                        var button = document.createElement("button")
                        button.classList.add("hov")
                        button.classList.add("bordered");
                        var eTitle = document.createElement("p")

                        var icon = document.createElement("i")
                        var aTitle = document.createElement("p")
                        aTitle.appendChild(document.createTextNode(data.recent[i].title))
                        icon.classList.add("fa")
                        icon.classList.add("fa-play")

                        eTitle.appendChild(icon);
                        eTitle.appendChild(document.createTextNode(data.recent[i].name));
                        button.appendChild(eTitle);
                        button.appendChild(aTitle);
                        button.addEventListener('click', function() {
                            loadPlay(data.recent[i].file, data.recent[i].title, data.recent[i].name);
                        })
                        document.getElementById("recents").appendChild(button)
                    })(i)
                }
            })
        }
    })
}

function replaceText(selector, text) {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}


function viewOffline(title) {
    // Show info about downloaded anime
    $("#main").empty();
    title = title;

    $("#main").load("view.html", function() {
        fs.readFile(path+"/data.json", 'utf8' , (err, data) => {
            data = JSON.parse(data)
            entryIndex = data.anime.findIndex(element => element.title == title)
            entry = data.anime[entryIndex]
            episodes = entry.episodes

            document.getElementById("cover-img").src = entry.image
            replaceText("anime-title", title)
            replaceText("description", entry.desc)
            deleteB = document.createElement("button");
            deleteB.appendChild(document.createTextNode("Toggle Delete"));
            deleteB.style.float = "right"
            deleteB.classList.add("hov")
            deleteB.addEventListener('click', function() {
                var x = document.getElementsByClassName("delete-b")
                for (var i = 0; i < x.length; i++) {
                    if (x[i].style.display == "inline") {
                        x[i].style.display = "none";
                    } else x[i].style.display = "inline";
                }
                /*
                .forEach(element => {
                    element.style[background-color] = "red";
                });*/
            })
            document.getElementById("delete").appendChild(deleteB)
            document.getElementById("delete").appendChild(document.createElement("br"))
            // No need to swap any orders now
            for (var i = 0; i < entry.episodes.length; i++) (function(i) {
                listItem = document.createElement("div");
                listItem.setAttribute('id', entryIndex);
                newEp = document.createElement("button");
                newEp.classList.add("hov")
                newEp.classList.add("check")
                newEp.style.margin = "10px"
                newEp.addEventListener('click', function() {
                    loadPlay(path+"/episodes/"+entry.title.replace(/[\W_]+/g,"-")+"/"+entry.episodes[i].id+".mp4", title, entry.episodes[i].name);
                })
                newEp.appendChild(document.createTextNode(entry.episodes[i].name));
                listItem.appendChild(newEp)

                deleteLink = document.createElement("a");
                deleteIcon = document.createElement("i");
                deleteIcon.classList.add("fa")
                deleteIcon.classList.add("fa-trash")
                deleteIcon.classList.add("delete-b")
                deleteLink.addEventListener('click', function() {
                    deleteEpisode(entry, entryIndex, entry.episodes[i].name, i)
                })
                deleteLink.appendChild(deleteIcon)
                listItem.appendChild(deleteLink)
                document.getElementById("ep-list").appendChild(listItem);
            })(i);
        })
    })
}

function loadLibrary() {
    if (onPlayer) exitPlay();

    $("#main").empty();
    $("#main").load("library.html", function() {
        if (!settings.devMode) {
            fs.readFile(path+"/data.json", 'utf8' , (err, data) => {
                entries = JSON.parse(data).anime
                for (var i = 0; i < entries.length; i++) (function(i){
                    var searchdiv = document.createElement("li")
                    var img = document.createElement("img");                 // Create a <li> node
                    var textnode = document.createTextNode(entries[i].title);         // Create a text node
                    img.src = entries[i].image
                    var title = document.createElement("a");
                    title.className = "poster";
                    title.appendChild(img)
                    var name = document.createElement("a");
                    name.className = "name";
                    name.appendChild(textnode)

                    searchdiv.appendChild(title)
                    searchdiv.appendChild(name)
                    var linked = document.createElement("a")
                    linked.addEventListener('click', function() {
                        viewOffline(entries[i].title)
                    })
                    linked.appendChild(searchdiv)
                    document.getElementById("results").appendChild(linked);
                })(i);


            })
        }
    })
}

function loadSearch() {
    if (onPlayer) exitPlay();

    $("#main").empty();
    $("#main").load("search.html", function() {
        var input = document.getElementById("searchTerm");
        input.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                document.getElementById("search").click();
            }
        });
        document.getElementById("search").addEventListener('click', () => {
            $("#results").empty();
            getAPI(`/manga?title=${encodeURI(document.getElementById("searchTerm").value)}`, function(res) {
                res.results.forEach(a => {
                    console.log(a)
                    console.log(a.data.attributes.title.en)
                    var div = document.createElement("div")
                    div.style.display = "inline";
                    var titleL = document.createElement("a")
                    var title = document.createElement("h2")

                    title.appendChild(document.createTextNode(a.data.attributes.title.en))
                    
                    title.addEventListener('click', function() {
                        loadView(a);
                    })
                    titleL.appendChild(title)
                    div.appendChild(titleL)
        
                    document.getElementById("results").appendChild(div)
                })
            })

        });
    })
}



function getAPI(hostpath, callback) {
    var options = {
        'method': 'GET',
        'hostname': 'api.mangadex.org',
        'path': hostpath,
        'headers': {
          'Cookie': '__ddg1=eJJJ7ZRVd1Tb9v6d0lSv'
        },
        'maxRedirects': 20
      };

      var req = https.request(options, function (res) {
        var chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          callback(JSON.parse(body.toString()));
        });
      
        res.on("error", function (error) {
          console.error(error);
        });
      });
      
      req.end();
}

function loadView(results) {
    $("#main").empty();
    getAPI(`/manga/${results.data.id}/feed?limit=500`, function(chapters) {
        $("#main").load("view.html", function() {
            data = results.data.attributes
            replaceText("anime-title", data.title.en)
            replaceText("status", data.status)
            replaceText("demo", data.publicationDemographic)
            var tagsList = "";
            for (var i = 0; i < data.tags.length; i++ ) {
                tagsList += data.tags[i].attributes.name.en + " ";
            }            

            replaceText("tags", tagsList)
            document.getElementById("anime-desc").innerHTML =  data.description.en.replace(/\[/g,"<").replace(/\]/g,">")
            console.log(chapters)

            for (var i = 0; i < chapters.results.length; i++) (function(i){
                if (chapters.results[i].data.attributes.translatedLanguage) {
                    var entry = document.createElement("tr");
                    var num = document.createElement("th")
                    num.appendChild(document.createTextNode(chapters.results[i].data.attributes.chapter + " " +chapters.results[i].data.attributes.translatedLanguage ));
                    entry.appendChild(num)
                    var title = document.createElement("th")
                    titleLink = document.createElement("a")
                    title.appendChild(document.createTextNode(chapters.results[i].data.attributes.title));
                    titleLink.appendChild(title)
                    titleLink.addEventListener('click', function() {
                        loadChapter(data.title.en, chapters.results[i].data.attributes.chapter, i, chapters.results, results)
                    })
                    entry.appendChild(titleLink)
                    document.getElementById("ch-list").appendChild(entry)
                }
            })(i)
        })
    })
}

function loadChapter(title, chapter, index, res, results) {
    $("#main").empty();
    $("#main").load("read.html", function() {
        replaceText("title", title + " Chapter " + chapter)
        document.getElementById("all").addEventListener('click', function() {
            loadView(results);
        })
        for(var i = 0; i < res[i].data.attributes.data.length; i++) {
            img = document.createElement("img")
            img.style.width= "100%";
            img.src = "https://s2.mangadex.org/data/"+res[index].data.attributes.hash+"/"+res[index].data.attributes.data[i]
            document.getElementById("main").appendChild(img)
        }
    })
    
}

function toggleNav() {
    if (document.getElementById("left-bar").style.width === "200px") {
        document.getElementById("left-bar").style.width = "50px";
        document.getElementById("right-bar").style.marginLeft = "100px";
        document.getElementById("settings").style.display = "none";
        document.getElementById("collapse-icon").classList.remove("fa-chevron-left")
        document.getElementById("collapse-icon").classList.add("fa-chevron-right")
        document.getElementById("left-bar").classList.add("collapsed")
    } else {
        document.getElementById("left-bar").style.width = "200px";
        document.getElementById("right-bar").style.marginLeft = "250px";
        document.getElementById("settings").style.display = "block";
        document.getElementById("collapse-icon").classList.add("fa-chevron-left")
        document.getElementById("collapse-icon").classList.remove("fa-chevron-right")
        document.getElementById("left-bar").classList.remove("collapsed")
    }

}
