import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "../styles/login.css"; // make sure this path matches where you save the CSS

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

    // Toggle overbox (switch to register/login)
    $toggleButton.on("click.loginToggle", (e) => {
      e && e.preventDefault();
      $overbox.toggleClass("active");
    });

    // Login handler (from index.js)
    $loginButton.on("click.login", (e) => {
      e.preventDefault();
      const username = $root.find("#name").val();
      const password = $root.find("#pass").val();

      const storedUser = localStorage.getItem(username);
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.password === password) {
            alert("Login Successful!");
            sessionStorage.setItem("loggedInUser", username);
            // keep original redirect behaviour (adjust for your routing if needed)
            window.location.href = "taskmanager.html";
          } else {
            alert("Incorrect password!");
          }
        } catch (err) {
          alert("Stored user data corrupted. Please register again.");
        }
      } else {
        alert("User not found! Please register.");
      }
    });

    // Register handler (from index.js)
    $registerButton.on("click.register", (e) => {
      e.preventDefault();
      const username = $root.find("#regname").val();
      const password = $root.find("#regpass").val();
      const repeatPassword = $root.find("#reregpass").val();

      if (password !== repeatPassword) {
        alert("Passwords do not match!");
        return;
      }

      const userExists = localStorage.getItem(username);
      if (userExists) {
        alert("User already exists! Please login.");
      } else {
        localStorage.setItem(username, JSON.stringify({ password }));
        alert("Signup successful! You can now login.");
        // emulate original toggle behaviour
        $toggleButton.trigger("click");
      }
    });

    // redirect if already logged in (same behaviour as original)
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
      $root.find(".input input").off(".bl");
      $root.find(".button").off(".ripple");
      $root.find(".alt-2").off(".alt2");
      $root.find(".material-button").off(".matbtn");
      $root.find(".click-efect").remove();
    };
  }, []);

  return (
    <div className="auth-wrapper"> {/* isolates page-level layout from other global css */}
      <div ref={rootRef} className="materialContainer">
        <div className="box">
          <div className="title">LOGIN</div>

          <div className="input">
            <label htmlFor="name">Username</label>
            <input type="text" name="name" id="name" />
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
        </div>

        <div className="overbox">
          <div className="material-button alt-2"><span className="shape" /></div>

          <div className="title">REGISTER</div>

          <div className="input">
            <label htmlFor="regname">Username</label>
            <input type="text" name="regname" id="regname" />
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
