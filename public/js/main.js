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

firebase.auth().onAuthStateChanged(function(user) {
  window.user = user;
  console.log("AuthStateChanged Flag");
  console.log("user => ", user);
});

var database = firebase.database();

// On Ready
$(document).ready(function() {
  // Materialize Components Init
  $(".dropdown-trigger").dropdown();
  $(".sidenav").sidenav();
  $(".modal").modal();

  // Listeners
  $("#registerForm").submit(function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Login In...");
    var email = $("#loginUser").val();
    var password = $("#loginPass").val();
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(function() {
        var newUID = firebase.auth().currentUser.uid;
        console.log("Registered and Logged In...");
        console.log("currentUID => ", newUID);
        if (newUID) {
          var name = $("#loginName").val();
          firebase
            .database()
            .ref("users/" + newUID)
            .set({
              name: name,
              email: email
            });

          //- LogIn ID Token
          firebase
            .auth()
            .currentUser.getIdToken(/* forceRefresh */ true)
            .then(function(idToken) {
              var form = {};
              form.idToken = idToken;
              $.ajax({
                type: "POST",
                url: "/login",
                data: form,
                success: function(res) {
                  console.log("Logged In.");
                  window.location.href = "/home";
                },
                error: function(error) {
                  console.log("Log In failed");
                }
              });
            })
            .catch(function(error) {
              // Handle error
            });
        } else {
          M.Toast.dismissAll();
          M.toast({
            html: "Incorrect Fields",
            classes: "toast-alert",
            displayLength: 3000
          });
        }
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == "auth/weak-password") {
          alert("The password is too weak.");
        } else {
          alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
      });
  });

  $("#loginForm").submit(function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Login In...");
    var email = $("#loginUser").val();
    var password = $("#loginPass").val();
    // Sign in with email and pass.
    // [START authwithemail]
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(function() {
        var credential = firebase.auth.EmailAuthProvider.credential(
          email,
          password
        );
        var auth = firebase.auth();
        var currentUser = auth.currentUser;
        console.log("Logged In...");
        console.log("currentUser => ", currentUser);
        if (currentUser) {
          //- LogIn ID Token
          firebase
            .auth()
            .currentUser.getIdToken(/* forceRefresh */ true)
            .then(function(idToken) {
              var form = {};
              form.idToken = idToken;
              $.ajax({
                type: "POST",
                url: "/login",
                data: form,
                success: function(res) {
                  console.log("Logged In.");
                  window.location.href = "/home";
                },
                error: function(error) {
                  console.log("Log In failed");
                }
              });
            })
            .catch(function(error) {
              // Handle error
            });
        } else {
          M.Toast.dismissAll();
          M.toast({
            html: "Incorrect user or password",
            classes: "toast-alert",
            displayLength: 3000
          });
        }
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === "auth/wrong-password") {
          alert("Wrong password.");
        } else {
          alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
      });
  });

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
