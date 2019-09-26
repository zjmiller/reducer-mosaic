import { Container } from "@material-ui/core";
import React, { useState } from "react";

import { Header } from "./Header";
import { RunAnalyzer } from "./RunAnalyzer";
import { ParticipationSection } from "./ParticipationSection";
import { SelectWhoYouAreHeader } from "./SelectWhoYouAreHeader";

const App: React.FC = () => {
  const [email, setEmail] = useState("1@email.com");

  return (
    <Container maxWidth="lg">
      <SelectWhoYouAreHeader email={email} setEmail={setEmail} />
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
          <ParticipationSection email={email} />
        </div>
      </div>
    </Container>
  );
};

export default App;
