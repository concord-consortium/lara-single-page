import React from "react";
import { renderHTML } from "../../../utilities/render-html";

import "./text-box.scss";

interface IProps {
  embeddable: any;
}

export class TextBox extends React.PureComponent<IProps>  {
  render () {
    const { embeddable } = this.props;
    return(
      <div className="textbox" data-cy="text-box">
        { embeddable.name && <div className="text-name">{embeddable.name}</div> }
        <div className="content">{renderHTML(embeddable.content)}</div>
      </div>
    );
  }
}
