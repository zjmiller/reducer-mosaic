import { Container } from "@material-ui/core";
import React from "react";

import { Header } from "./Header";
import { ParticipationSection } from "./ParticipationSection";

const App: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Header />
      <ParticipationSection email={"1@email.com"} />
    </Container>
  );
};

export default App;
