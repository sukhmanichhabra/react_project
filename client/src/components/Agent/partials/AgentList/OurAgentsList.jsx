import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AgentListCard from "./AgentListCard";
import "../../styles/AgentList/OurAgentsList.css";

function OurAgentsList() {
  // State
  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [resultsCount, setResultsCount] = useState({
    start: 0,
    end: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  // Use URL search params for state
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search") || "";

  // Local state for the controlled search input
  const [searchInput, setSearchInput] = useState(search);

  // Fetch agents from API whenever URL params change
  useEffect(() => {
    async function fetchAgents() {
      setLoading(true);
      try {
        // Build the query URL
        const query = new URLSearchParams({
          page: page,
          filter: filter,
          search: search,
        });

        const response = await fetch(`/api/agent?${query.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const result = await response.json();

        // Assuming API returns data in this structure
        const data = result.data || {};

        setAgents(data.agents || []);

        setPagination({
          page: data.pagination?.page || 1,
          totalPages: data.pagination?.totalPages || 1,
          hasPrev: data.pagination?.hasPrev || false,
          hasNext: data.pagination?.hasNext || false,
        });

        setResultsCount({
          start: data.resultsCount?.start || 0,
          end: data.resultsCount?.end || 0,
          total: data.resultsCount?.total || 0,
        });
      } catch (error) {
        console.error("Error fetching agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
        // Refresh AOS after content loads
        if (typeof window.AOS !== "undefined") {
          setTimeout(() => {
            window.AOS.refresh();
          }, 100);
        }
      }
    }
    fetchAgents();
  }, [page, filter, search]); // Re-fetch when these change

  // Update local search input if URL search changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Pagination controls
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, filter, search });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter controls
  const handleFilter = (newFilter) => {
    setSearchParams({ page: 1, filter: newFilter, search });
  };

  // Search controls
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const executeSearch = () => {
    setSearchParams({ page: 1, filter, search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchParams({ page: 1, filter, search: "" });
  };

  // Render
  return (
    <div className="agt-list-our-container">
      <section
        className="agt-list-our-agents-section"
        data-aos="fade-up"
        data-aos-duration="800"
      >
        <div className="agt-list-our-main-container">
          <div className="agt-list-our-section-container">
            <div className="agt-list-our-section-header">
              <h2 className="agt-list-our-section-title">
                <i className="fas fa-users"></i> Our Expert Agents
              </h2>
              <p className="agt-list-our-section-subtitle">
                Browse our selection of top-rated real estate professionals
              </p>
            </div>

            <div className="agt-list-our-results-section">
              <span className="agt-list-our-results-count">
                Showing{" "}
                <strong>
                  {resultsCount.start}-{resultsCount.end}
                </strong>{" "}
                of <strong>{resultsCount.total}</strong> results
              </span>

              {/* --- UPDATED SEARCH JSX --- */}
              <div className="agt-list-our-search-name">
                <div className="agt-list-our-search-input-wrapper">
                  <input
                    type="text"
                    id="agent-search"
                    placeholder="Search by agent name..."
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") executeSearch();
                      if (e.key === "Escape") clearSearch();
                    }}
                  />
                  <button
                    type="button"
                    className="agt-list-our-search-clear"
                    id="search-clear"
                    onClick={clearSearch}
                    style={{ display: searchInput ? "block" : "none" }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <button
                  type="button"
                  id="search-btn"
                  className="agt-list-our-search-btn"
                  onClick={executeSearch}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
              {/* --- END UPDATED SEARCH JSX --- */}

            </div>

            {/* Filter Options */}
            <div
              className="agt-list-our-filter-options"
              data-aos="fade-up"
              data-aos-duration="600"
            >
              <button
                className={`agt-list-our-filter-btn${
                  filter === "all" ? " active" : ""
                }`}
                onClick={() => handleFilter("all")}
              >
                All Agents
              </button>
              <button
                className={`agt-list-our-filter-btn${
                  filter === "Verified" ? " active" : ""
                }`}
                onClick={() => handleFilter("Verified")}
              >
                <i className="fas fa-check-circle"></i> Verified
              </button>
              <button
                className={`agt-list-our-filter-btn${
                  filter === "Not Verified" ? " active" : ""
                }`}
                onClick={() => handleFilter("Not Verified")}
              >
                <i className="fas fa-times-circle"></i> Not Verified
              </button>
            </div>

            {/* Agent Grid */}
            <div className="agt-list-our-grid">
              {loading ? (
                <div className="agt-list-our-loading">Loading...</div>
              ) : agents.length > 0 ? (
                agents.map((agent) => (
                  <AgentListCard key={agent._id} agent={agent} />
                ))
              ) : (
                <div className="agt-list-our-no-agents">
                  <h3>
                    <i className="fas fa-info-circle"></i> No Agents Found
                  </h3>
                  <p>No agents match your current filters. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pagination */}
      {!loading && agents.length > 0 && pagination.totalPages > 1 && (
        <div className="agt-list-our-pagination" data-aos="fade-up">
          {pagination.hasPrev && (
            <Link
              to={`/agent?page=${
                pagination.page - 1
              }&filter=${filter}&search=${search}`}
              className="agt-list-our-page-nav prev"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(pagination.page - 1);
              }}
            >
              &lt;
            </Link>
          )}
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <Link
              key={i + 1}
              to={`/agent?page=${i + 1}&filter=${filter}&search=${search}`}
              className={`agt-list-our-page-num${
                pagination.page === i + 1 ? " active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i + 1);
              }}
            >
              {i + 1}
            </Link>
          ))}
          {pagination.hasNext && (
            <Link
              to={`/agent?page=${
                pagination.page + 1
              }&filter=${filter}&search=${search}`}
              className="agt-list-our-page-nav next"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(pagination.page + 1);
              }}
            >
              &gt;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default OurAgentsList;