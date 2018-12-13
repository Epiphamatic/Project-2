let data = "";
let at;
let input = $("#music-input").val();

// * this function will run as soon as script loaded.
// * data is a array. a list of track. FRONTEND
// * at means access token. coming from backend database table token
(function () {
    $.get("/api/guest", function (response) {
        data = response.data;
        at = response.token[0].accessToken;
        console.log(response);
        console.log(data);
        console.log(at);
    });
})();
// Autocomplete. when guest input more than 3 characters , the function will be fired.
//function input{access token}(coming from the /api/guest) and {query term}
$("#song_name").autocomplete({
    source: function (request, response) {
        $.ajax({
            type: "GET",
            url: "https://api.spotify.com/v1/search",
            headers: {
                Authorization: `Bearer ${at}`,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            data: {
                type: "track",
                q: request.term,
                limit: 10,
                market: "US",
                offset: 3
            },
            success: function (data) {
                response(
                    // console.log(data.tracks.items)
                    $.map(data.tracks.items, function (item) {
                        console.log(item.artists);
                        return {
                            lable: `${item.name} by ${item.artists[0].name}`,
                            value: `${item.name} by ${item.artists[0].name}`,
                            id: item.id
                        };
                    })
                );
            }
        });
    },
    minLength: 3,
    select: function (event, ui) {
        $("#music-input").val(ui.item.value);
        window.location.href = "#" + ui.item.id;
    }
});

document.getElementById("addSong").addEventListener(
    "click",
    function () {
        $.get("/api/thumbdown/17").then(function (data) {
            return;
        });
    },
    false
);

function addToPlayList() {
   
    var myform = document.getElementById("songform");
   var song  = $("input[name='song_name']").val();
   alert("Inside addToPlayList"+song);
    $.ajax("/music/add/", {
        type: "POST",
     //   data: { music_name: $("#song_name")}
    }).then(function (response) {
        //  showHide();
        console.log("this is the your list*******" + response);
        //console.log(response);
    });
}

  //    $(document).on("click", "#submit", addToPlayList);