// aadishv.github.io/src/components/vairc/App.tsx
import React from "react";
import { Layout } from "./Layout";
import { ColorFeed, DepthFeed } from "./components/Feeds";
import { JsonRenderer } from "./components/InfoPanels";
import DetailsPanel from "./components/DetailsPanel";
import FieldView from "./components/FieldView";
import 'react-mosaic-component/react-mosaic-component.css';
import './app.css';

// Create the map of window IDs to components
const windowComponents = {
  1: ColorFeed,
  2: DepthFeed,
  3: JsonRenderer,
  4: DetailsPanel,
  5: FieldView,
};

// Create the map of window IDs to titles
const windowTitles = {
  1: "Color Feed",
  2: "Depth Feed",
  3: "Raw Data",
  4: "Details",
  5: "Field View"
};

// Main App Component
export default function VAIRCApp() {
  return (
    <Layout windowComponents={windowComponents} windowTitles={windowTitles} />
  );
}