import React from "react";
import { EstimatedTime } from "./estimated-time";
import { renderHTML } from "../../utilities/render-html";

import "./activity-summary.scss";

interface IProps {
  activityName: string;
  introText: string | null;
  time: number | null;
}

export class ActivitySummary extends React.PureComponent <IProps> {
  render() {
    return (
      <div className="activity-summary" data-cy="activity-summary">
        <div className="activity-title"><h2>{this.props.activityName}</h2></div>
        <div className="activity-content intro-txt">
          { this.props.introText && renderHTML(this.props.introText) }
        </div>
        { this.props.time && <EstimatedTime time={this.props.time} /> }
      </div>
    );
  }
}
