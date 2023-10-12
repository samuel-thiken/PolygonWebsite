import React, { useContext, useRef } from "react";
import Section from "../../partials/Section";
import I18n from "../../utils/I18n";
import superagent from "superagent";
import { AuthContext } from "../../utils/Authentication";
import { useNavigate } from "react-router-dom";

export default function Login(): React.ReactElement {
  let usernameField: HTMLInputElement | null;
  let passworField: HTMLInputElement | null;
  const { setToken } = useContext(AuthContext);
  const naviguate = useNavigate();

  const submitLogin = async () => {
    if (!usernameField || !passworField) return;
    try {
      const result = await superagent.post(`${process.env.REACT_APP_API_SERVER}/auth/login`).send({
        username: usernameField.value,
        password: passworField.value
      });
      setToken(result.body.token);
      naviguate("/r/dashboard");
    } catch (e) {
      console.error(e);
    }
  };
  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    submitLogin();
  };

  return (
    <>
      <Section type="primary">
        <div className="m-5">
          <p className="title">Login</p>
          <p className="subtitle">
            <I18n t="stats.subtitle" />
          </p>
        </div>
      </Section>
      <Section>
          <form onSubmit={submitForm}>
            <div>
              <label htmlFor="username">
                Username <br />
                <input type={"text"} id="username" ref={(r) => (usernameField = r)} />
              </label>
            </div>
            <div>
              <label htmlFor="username">
                Password <br />
                <input type={"password"} id="password" ref={(r) => (passworField = r)} />
              </label>
            </div>
            <button className="bf-btn small mt-4" onClick={submitLogin}>
              Login
            </button>
          </form>
      </Section>
    </>
  );
}
