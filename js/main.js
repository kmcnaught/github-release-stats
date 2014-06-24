var apiRoot = "https://api.github.com/";

// validate the user input
function validateInput() {
    if ($("#username").val().length > 0 && $("#repository").val().length > 0) {
        $("#get-stats-button").prop("disabled", false);
    } else {
        $("#get-stats-button").prop("disabled", true);
    }
}

// Callback function for getting user repositories
function getUserRepos() {
    var user = $("#username").val();

    var url = apiRoot + "users/" + user + "/repos";
    $.getJSON(url, function(data) {
        var repoNames = [];

        $.each(data, function(index, item) {
            repoNames.push(item.name);
        });
        
        var autoComplete = $('#repository').typeahead();
        autoComplete.data('typeahead').source = repoNames;
    });
}

// Display the stats
function showStats(data) {
    var err = false;
    var errMessage = '';

    if(data.statusText == "Not Found") {
        err = true;
        errMessage = "The project does not exist!";
    }

    if(data.length == 0) {
        err = true;
        errMessage = "There are no releases for this project";
    }

    var html = '';

    if(err) {
        html = "<div class='col-md-6 col-md-offset-3 error output'>" + errMessage + "</div>";
    } else {
        html += "<div class='col-md-6 col-md-offset-3 output'>";
        var latest = true;

        $.each(data, function(index, item) {
            var releaseTag = item.tag_name;
            var releaseURL = item.html_url;
            var releaseAssets = item.assets;
            var hasAssets = releaseAssets.length != 0;
            var releaseAuthor = item.author;
            var publishDate = item.published_at.split("T")[0];

            if(latest) {
                html += "<div class='row release latest-release'>" +
                    "<h2><a href='" + releaseURL + "' target='_blank'>" +
                    "<span class='glyphicon glyphicon-tag'></span>&nbsp&nbsp" +
                    "Latest Release: " + releaseTag +
                    "</a></h2><hr class='latest-release-hr'>";
                latest = false;
            } else {
                html += "<div class='row release'>" +
                    "<h4><a href='" + releaseURL + "' target='_blank'>" +
                    "<span class='glyphicon glyphicon-tag'></span>&nbsp&nbsp" +
                    releaseTag +
                    "</a></h4><hr class='release-hr'>";
            }

            html += "<h4><span class='glyphicon glyphicon-info-sign'></span>&nbsp&nbsp" +
                "Release Info:</h4>";

            html += "<ul>";

            html += "<li><span class='glyphicon glyphicon-user'></span>&nbsp&nbspRelease Author: " +
                "<a href='" + releaseAuthor.html_url + "'>" + releaseAuthor.login  +"</a><br></li>";

            html += "<li><span class='glyphicon glyphicon-calendar'></span>&nbsp&nbspPublished on: " +
                publishDate + "</li>";

            html += "</ul>";
        
            if(hasAssets) {
                html += "<h4><span class='glyphicon glyphicon-download'></span>" +
                    "&nbsp&nbspDownload Info: </h4>";

                html += "<ul>";
                $.each(releaseAssets, function(index, asset) {
                    var assetSize = (asset.size / 1000000.0).toFixed(2);
                    var lastUpdate = asset.updated_at.split("T")[0];
                    html += "<li>" + asset.name + "(" + assetSize + "MB) - Downloaded " +
                        asset.download_count + " times.<br><i>Last updated on " + lastUpdate + "</i></li>";
                });
                html += "</ul>";
            }
            html += "</div>";
        });

        html += "</div>";
    }

    var resultDiv = $("#stats-result");
    resultDiv.hide();
    resultDiv.html(html);
    $("#loader-gif").hide();
    resultDiv.slideDown();
}

// Callback function for getting release stats
function getStats() {
    var user = $("#username").val();
    var repository = $("#repository").val();

    var url = apiRoot + "repos/" + user + "/" + repository + "/releases";
    $.getJSON(url, showStats).fail(showStats);
}

// The main function
$(function() {
    $("#loader-gif").hide();

    validateInput();
    $("#username, #repository").keyup(validateInput);

    $("#username").change(getUserRepos);

    $("#get-stats-button").click(function() {
        $(".output").hide();
        $("#description").hide();
        $("#loader-gif").show();
        getStats();
    });
});
