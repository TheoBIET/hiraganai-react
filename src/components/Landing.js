import { Link } from "react-router-dom";

import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { RiGitRepositoryLine } from "react-icons/ri";

function Landing() {
  const navigationLinks = [
    {
      path: "/learning",
      content: "Learning Hiraganas",
      disabled: false,
    },
    {
      path: "/find",
      content: "Find Hiraganas",
      disabled: true,
    },
    {
      path: "/discover",
      content: "Discover Hiraganas",
      disabled: true,
    },
  ];

  const socialLinks = [
    {
      icon: <FaLinkedin />,
      url: "https://www.linkedin.com/in/juan-jose-gonzalez-gonzalez-b9",
      class: "--linkedin",
    },
    {
      icon: <FaGithub />,
      url: "https://www.linkedin.com/in/juan-jose-gonzalez-gonzalez-b9",
      class: "--github",
    },
    {
      icon: <FaTwitter />,
      url: "https://www.linkedin.com/in/juan-jose-gonzalez-gonzalez-b9",
      class: "--twitter",
    },
    {
      icon: <RiGitRepositoryLine />,
      url: "https://www.linkedin.com/in/juan-jose-gonzalez-gonzalez-b9",
      class: "--source",
    },
  ];
  return (
    <div className="Landing">
      <div className="Landing__title">
        <h1>Nihongo</h1>
        <p>Learn Japanese Alphabet with AI</p>
      </div>

      <nav className="Landing__nav">
        {navigationLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`Landing__nav__link ${
              link.disabled ? "--disabled" : ""
            }`}>
            {link.content}
          </Link>
        ))}
      </nav>

      <div className="Landing__footer">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://github.com/TheoBIET"
            target="_blank"
            rel="noreferrer">
            Théo BIET
          </a>
        </p>
        <ul class="Landing__footer__socials">
          {socialLinks.map((link) => (
            <a href={link.url} target="_blank" rel="noreferrer">
              <li className={`Landing__footer__socials__item ${link.class}`}>
                {link.icon}
              </li>
            </a>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Landing;
