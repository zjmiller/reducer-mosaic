import { Container } from "@material-ui/core";
import React from "react";

import { Header } from "./Header";
import { RunAnalyzer } from "./RunAnalyzer";
import { ParticipationSection } from "./ParticipationSection";

const App: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%"
        }}
      >
        <div style={{ width: "45%" }}>
          <h2 style={{ marginBottom: "10px" }}>Analyze Runs</h2>
          <RunAnalyzer />
        </div>
        <div style={{ width: "45%" }}>
          <h2 style={{ marginBottom: "10px" }}>Participate!</h2>
          <ParticipationSection />
        </div>
      </div>
    </Container>
  );
};

export default App;
