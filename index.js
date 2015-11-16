/**
 * Created by avas on 11/14/2015.
 */

var timer; // Timer to optimizing search

document.getElementById("search-text").onkeyup = function(e){
    clearTimeout(timer);  // Clearing timer on each keypress
    if (e.keyCode == 13)
        doSearch(e.target.value);
    else
        timer = setTimeout(function(){
            doSearch(e.target.value);
        }, 1000); // Trigger search only if user haults keying for 1 second.. This is to optimize the searching feature.
}

/*
    Event delegator to optimize event handling
 */
document.getElementById("search-display-panel").onclick = function(e){
    if((e.target.className).indexOf("view-details-icon")!= -1){
        e.target.parentNode.querySelector(".tile-desc-panel").setAttribute("style", "display: block");
    }
}

// Facebook login
document.getElementById("login-fb-button").onclick = function () {
    FB.login(function(response){
        if(response.authResponse){
            document.getElementById("search-text").removeAttribute("disabled");
            document.getElementById("login-warning-text").setAttribute("style", "display:none;")
        }

    }, {scope: 'public_profile'});
};

// The actual search implementation
function doSearch(search){
    showLoading(); // Shows loding indicator

    // This is the FB Graph Search API. Returns fields in the response (id,name,location,category,link,picture). Limit is default 25
    FB.api('/search', {q:search, type:"page", limit: '', fields:"id,name,location,category,link,picture"}, function(response) {
        document.getElementById("search-display-panel").innerHTML = "";
        formatResponse(response);
    });

}

// Custom comparator function
function compare(a,b) {
    if (a.name > b.name)
        return -1;
    if (a.name < b.name)
        return 1;
    return 0;
}

// Formatting response and construting search details panel
function formatResponse(response){

    var templateRef = document.getElementById("tile-desc"), templateToHtml;
    var dataArray = response.data.sort(compare);  // Searching the array of objects in desc order of name
    var docFragment = document.createDocumentFragment();  // Creating document fragment to optimize page rendering.
    var img, div, span, tiledescDiv ;
    var name, url, category, link, city, country, zip;
    for(var i = 0; i<dataArray.length; i++){
        name,url,category,link,city = "", country = "", zip = "";
        div = document.createElement("div");
        div.setAttribute("class", "tile");

        name = dataArray[i].name;
        url = dataArray[i].picture.data.url;
        category = dataArray[i].category;
        link = dataArray[i].link;
        if(dataArray[i].location && dataArray[i].location.city){
            city = dataArray[i].location.city;
        }
        if(dataArray[i].location && dataArray[i].location.country){
            country = dataArray[i].location.country;
        }
        if(dataArray[i].location && dataArray[i].location.zip){
            zip = dataArray[i].location.zip;
        }

        // Leveraging Javascript micro templating functionality.
        templateToHtml = `<img src='${url}'>
            <span class="name">${name}</span>
            <img class="view-details-icon" src="View_Details.png" style="">
            <div class="tile-desc-panel" style="display:none">
                <img class="image-large" src="${url}" style="">
                <ul>
                    <li>Category : ${category}</li>
                    <li><a href="${link}" target="_blank">Goto Page</a></li>
                    <li>City : ${city}</li>
                    <li>Country : ${country}</li>
                    <li>Zip : ${zip}</li>
                </ul>

            </div>`;

        div.innerHTML = templateToHtml;
        docFragment.appendChild(div);

    }

    document.getElementById("search-display-panel").appendChild(docFragment);
    hideLoading();
}

// Generic function to show loading indicator
function showLoading(target){
    document.getElementById("loading").setAttribute("style", "display:block");
}

// Generic function to hide loading indicator
function hideLoading(){
    document.getElementById("loading").setAttribute("style", "display:none");
}