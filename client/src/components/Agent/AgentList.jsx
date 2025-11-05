import { useEffect } from "react";
// Note: AgentList.css was empty, but if you create it, its classes should be prefixed
import "./styles/AgentList/AgentList.css";
import AgentBenefits from "./partials/AgentList/AgentBenefits";
import OurAgentsList from "./partials/AgentList/OurAgentsList";
import AgentListClients from "./partials/AgentList/AgentListClients";

function AgentList() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {/* Agent Benefits Section */}
      <AgentBenefits />

      {/* Our Agents Section */}
      <OurAgentsList />

      {/* Stats and Client Testimonials Section */}
      <AgentListClients />
    </div>
  );
}

export default AgentList;
