import React from "react";
import { TextBox } from "./text-box/text-box";
import { ManagedInteractive } from "./managed-interactive/managed-interactive";
import { ActivityLayouts, PageLayouts } from "../../utilities/activity-utils";
import { EmbeddablePlugin } from "./plugins/embeddable-plugin";

import "./embeddable.scss";
import { EmbeddableWrapper } from "../../types";

interface IProps {
  activityLayout?: number;
  embeddableWrapper: EmbeddableWrapper;
  isPageIntroduction: boolean;
  pageLayout: string;
  questionNumber?: number;
}

export const Embeddable: React.FC<IProps> = (props) => {
  const { activityLayout, embeddableWrapper, isPageIntroduction, pageLayout, questionNumber } = props;
  const embeddable = embeddableWrapper.embeddable;

  let qComponent = undefined;
  if (embeddable.type === "MwInteractive" || embeddable.type === "ManagedInteractive") {
    qComponent = <ManagedInteractive embeddable={embeddable} questionNumber={questionNumber} />;
  } else if (embeddable.type === "Embeddable::EmbeddablePlugin" && embeddable.plugin?.component_label === "windowShade") {
    qComponent = <EmbeddablePlugin embeddable={embeddable} />;
  } else if (embeddable.type === "Embeddable::Xhtml") {
    qComponent = <TextBox embeddable={embeddable} isPageIntroduction={isPageIntroduction} />;
  }

  const staticWidth = pageLayout === PageLayouts.FortySixty || pageLayout === PageLayouts.SixtyForty || pageLayout === PageLayouts.Responsive;
  const singlePageLayout = activityLayout === ActivityLayouts.SinglePage;
  return (
    <div className={`embeddable ${embeddableWrapper.embeddable.is_full_width || staticWidth || singlePageLayout ? "full-width" : "reduced-width"}`} data-cy="embeddable">
      { qComponent || <div>Content type not supported</div> }
    </div>
  );
};
