import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "../styles/login.css";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByYr9Tl6J9-B6OcbXadQZjOVlFt6ZFAxY",
  authDomain: "sdlproj-96a12.firebaseapp.com",
  projectId: "sdlproj-96a12",
  storageBucket: "sdlproj-96a12.firebasestorage.app",
  messagingSenderId: "755626962462",
  appId: "1:755626962462:web:ba2c5424887089b06c880f",
  measurementId: "G-MR7WJPKTHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginRegister() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $root = $(rootRef.current);

    // find elements inside component
    const $loginButton = $root.find(".button.login button");
    const $registerButton = $root.find(".overbox .button button");
    const $toggleButton = $root.find(".material-button.alt-2");
    const $overbox = $root.find(".overbox");
    const $box = $root.find(".box");
    const $reviewerButton = $root.find(".reviewer-login-btn");

    // Toggle overbox (switch to register/login)
    $toggleButton.on("click.loginToggle", (e) => {
      e && e.preventDefault();
      $overbox.toggleClass("active");
    });

    // Login handler - Firebase Authentication
    $loginButton.on("click.login", (e) => {
      e.preventDefault();
      const email = $root.find("#name").val();
      const password = $root.find("#pass").val();

      if (!email || !password) {
        alert("Please enter email and password!");
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          alert("Login Successful!");
          sessionStorage.setItem("loggedInUser", user.uid);
          window.location.href = "taskmanager.html";
        })
        .catch((error) => {
          const errorMessage = error.message;
          if (error.code === "auth/user-not-found") {
            alert("User not found! Please register.");
          } else if (error.code === "auth/wrong-password") {
            alert("Incorrect password!");
          } else {
            alert("Login Error: " + errorMessage);
          }
        });
    });

    // Register handler - Firebase Authentication
    $registerButton.on("click.register", (e) => {
      e.preventDefault();
      const email = $root.find("#regname").val();
      const password = $root.find("#regpass").val();
      const repeatPassword = $root.find("#reregpass").val();

      if (!email || !password || !repeatPassword) {
        alert("Please fill all fields!");
        return;
      }

      if (password !== repeatPassword) {
        alert("Passwords do not match!");
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          alert("Signup successful! You can now login.");
          // Clear register form
          $root.find("#regname").val("");
          $root.find("#regpass").val("");
          $root.find("#reregpass").val("");
          // Switch back to login
          $toggleButton.trigger("click");
        })
        .catch((error) => {
          const errorMessage = error.message;
          if (error.code === "auth/email-already-in-use") {
            alert("User already exists! Please login.");
          } else if (error.code === "auth/weak-password") {
            alert("Password is too weak! Use at least 6 characters.");
          } else if (error.code === "auth/invalid-email") {
            alert("Please enter a valid email address!");
          } else {
            alert("Registration Error: " + errorMessage);
          }
        });
    });

    // Reviewer login handler
    $reviewerButton.on("click.reviewer", (e) => {
      e.preventDefault();
      const reviewerEmail = "reviewer@taskmanager.com";
      const reviewerPassword = "reviewer123";

      signInWithEmailAndPassword(auth, reviewerEmail, reviewerPassword)
        .then((userCredential) => {
          const user = userCredential.user;
          alert("Login as Reviewer Successful!");
          sessionStorage.setItem("loggedInUser", user.uid);
          sessionStorage.setItem("userRole", "reviewer");
          window.location.href = "taskmanager.html";
        })
        .catch((error) => {
          alert("Reviewer login error. Please contact admin.");
          console.error(error);
        });
    });

    // redirect if already logged in
    if (sessionStorage.getItem("loggedInUser")) {
      window.location.href = "taskmanager.html";
    }

    // ----- script.js behaviour: floating labels, ripple, overbox animations -----
    // floating labels & spin expansion
    $root.find(".input input").off("focus.bl").on("focus.bl", function () {
      const $this = $(this);
      $this.parent(".input").each(function () {
        $("label", this).css({
          "line-height": "18px",
          "font-size": "18px",
          "font-weight": "100",
          top: "0px",
        });
        $(".spin", this).css({
          width: "100%",
        });
      });
    });

    $root.find(".input input").off("blur.bl").on("blur.bl", function () {
      const $this = $(this);
      $(".spin", $this.parent(".input")).css({
        width: "0px",
      });

      if ($this.val() === "") {
        $this.parent(".input").each(function () {
          $("label", this).css({
            "line-height": "60px",
            "font-size": "24px",
            "font-weight": "300",
            top: "10px",
          });
        });
      }
    });

    // ripple click effect & active class
    $root.find(".button").off("click.ripple").on("click.ripple", function (e) {
      const $btn = $(this);
      const pX = e.pageX,
        pY = e.pageY;
      const oX = parseInt($btn.offset().left),
        oY = parseInt($btn.offset().top);

      const span = $(
        '<span class="click-efect x-' +
          oX +
          " y-" +
          oY +
          '" style="margin-left:' +
          (pX - oX) +
          "px;margin-top:" +
          (pY - oY) +
          'px;"></span>'
      );
      $btn.append(span);
      span.animate(
        {
          width: "500px",
          height: "500px",
          top: "-250px",
          left: "-250px",
        },
        600,
        function () {
          setTimeout(() => {
            span.remove();
          }, 400);
        }
      );
      $("button", this).addClass("active");
      setTimeout(() => {
        $("button", this).removeClass("active");
      }, 900);
    });

    // alt-2 shrink behavior
    $root.find(".alt-2").off("click.alt2").on("click.alt2", function () {
      const $this = $(this);
      if (!$this.hasClass("material-button")) {
        $root.find(".shape").css({
          width: "100%",
          height: "100%",
          transform: "rotate(0deg)",
        });

        setTimeout(function () {
          $overbox.css({
            overflow: "initial",
          });
        }, 600);

        $this.animate(
          {
            width: "140px",
            height: "140px",
          },
          500,
          function () {
            $box.removeClass("back");
            $this.removeClass("active");
          }
        );

        $overbox.find(".title").fadeOut(300);
        $overbox.find(".input").fadeOut(300);
        $overbox.find(".button").fadeOut(300);

        $root.find(".alt-2").addClass("material-buton");
      }
    });

    // material-button expand behavior
    $root.find(".material-button").off("click.matbtn").on("click.matbtn", function () {
      const $this = $(this);
      if ($this.hasClass("material-button")) {
        setTimeout(function () {
          $overbox.css({
            overflow: "hidden",
          });
          $box.addClass("back");
        }, 200);

        $this.addClass("active").animate(
          {
            width: "700px",
            height: "700px",
          },
          500
        );

        setTimeout(function () {
          $root.find(".shape").css({
            width: "50%",
            height: "50%",
            transform: "rotate(45deg)",
          });

          $overbox.find(".title").fadeIn(300);
          $overbox.find(".input").fadeIn(300);
          $overbox.find(".button").fadeIn(300);
        }, 700);

        $this.removeClass("material-button");
      }

      if ($root.find(".alt-2").hasClass("material-buton")) {
        $root.find(".alt-2").removeClass("material-buton");
        $root.find(".alt-2").addClass("material-button");
      }
    });

    // cleanup on unmount
    return () => {
      $toggleButton.off(".loginToggle");
      $loginButton.off(".login");
      $registerButton.off(".register");
      $reviewerButton.off(".reviewer");
      $root.find(".input input").off(".bl");
      $root.find(".button").off(".ripple");
      $root.find(".alt-2").off(".alt2");
      $root.find(".material-button").off(".matbtn");
      $root.find(".click-efect").remove();
    };
  }, []);

  return (
    <div className="auth-wrapper">
      <div ref={rootRef} className="materialContainer">
        <div className="box">
          <div className="title">LOGIN</div>

          <div className="input">
            <label htmlFor="name">Email</label>
            <input type="email" name="name" id="name" />
            <span className="spin"></span>
          </div>

          <div className="input">
            <label htmlFor="pass">Password</label>
            <input type="password" name="pass" id="pass" />
            <span className="spin"></span>
          </div>

          <div className="button login">
            <button><span>GO</span> <i className="fa fa-check" /></button>
          </div>

          <a href="/" className="pass-forgot">Forgot your password?</a>

          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <button className="reviewer-login-btn" style={{ padding: "8px 16px", fontSize: "12px", backgroundColor: "#f0f0f0", border: "1px solid #ED2553", color: "#ED2553", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
              Login as Reviewer
            </button>
          </div>
        </div>

        <div className="overbox">
          <div className="material-button alt-2"><span className="shape" /></div>

          <div className="title">REGISTER</div>

          <div className="input">
            <label htmlFor="regname">Email</label>
            <input type="email" name="regname" id="regname" />
            <span className="spin"></span>
          </div>

          <div className="input">
            <label htmlFor="regpass">Password</label>
            <input type="password" name="regpass" id="regpass" />
            <span className="spin"></span>
          </div>

          <div className="input">
            <label htmlFor="reregpass">Repeat Password</label>
            <input type="password" name="reregpass" id="reregpass" />
            <span className="spin"></span>
          </div>

          <div className="button">
            <button><span>NEXT</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}