import React from "react";
import ccLogo from "../../assets/cc-logo.png";
import { ProjectTypes } from "../../utilities/project-utils";

import './header.scss';

interface IProps {
  fullWidth?: boolean;
  projectId: number | null;
}

export class Header extends React.PureComponent <IProps> {
  render() {
    const { fullWidth, projectId } = this.props;
    const projectType = ProjectTypes.find(pt => pt.id === projectId);
    const logo = projectType?.logo;
    const projectURL = projectType?.url || "";
    const linkClass = projectURL ? "" : "no-link";
    return (
      <div className="header" data-cy="header">
        <div className={`inner ${fullWidth ? "full" : ""}`}>
          <div className={`left ${linkClass}`} onClick={this.handleProjectLogoClick(projectURL)}>
            { logo && <img src={logo} className="project-logo" data-cy="project-logo" /> }
          </div>
          <div className="right" onClick={this.handleConcordLogoClick}>
            <img src={ccLogo} className="logo" />
          </div>
        </div>
      </div>
    );
  }

  private handleProjectLogoClick = (url: string) => () => {
    if (url) {
      window.open(url);
    }
  }

  private handleConcordLogoClick = () => {
    window.open("https://concord.org/");
  }
}
