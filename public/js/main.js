// Functions
function shareFB(img) {
  // FB.ui({
  //       method: 'feed',
  //       link: "The link you want to share",
  //       picture: 'The picture url',
  //       name: "The name who will be displayed on the post",
  //       description: "The description who will be displayed"
  //     }, function(response){
  //         console.log(response);
  //     }
  // );
  // var u = img.src;
  // console.log('image url: ',u);
  // // t=document.title;
  // var t = 'randomImage';
  // window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t),'sharer','toolbar=0,status=0,width=626,height=436');return false;
  // FB.ui(
  //   {
  //       method: `share`,
  //       name: 'Facebook Dialogs',
  //       href: $(location).attr('href'),
  //       link: 'https://developers.facebook.com/docs/dialogs/',
  //       picture: img.src,
  //       caption: 'Ishelf Book',
  //       description: 'your description'
  //   },
  //   function (response) {
  //       if (response && response.post_id) {
  //           alert('success');
  //       } else {
  //           alert('error');
  //       }
  //   }
  // );
}

// On Ready
$(document).ready(function() {
  // Materialize Components Init
  $(".dropdown-trigger").dropdown();
  $(".sidenav").sidenav();

  // Listeners
  $("#loginOut").click(function() {
    firebase
      .auth()
      .signOut()
      .then(function() {
        console.log("Sign-out successful.");
      })
      .catch(function(error) {
        console.log("An error happened on Log out.");
      });
  });
});
