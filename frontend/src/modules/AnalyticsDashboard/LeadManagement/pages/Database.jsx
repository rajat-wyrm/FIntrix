import React, { useState, useMemo, useRef, useEffect } from "react";
import InputField from "../components/InputField.jsx";
import leadsService from "../services/leads.js";

// Database Search page connected to backend leads API

const DatabaseSearch = () => {
  // Filters and form state
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [skills, setSkills] = useState("");
  const [size, setSize] = useState("");
  const [revenue, setRevenue] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [companyTitle, setCompanyTitle] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [foundedDay, setFoundedDay] = useState("");
  const [foundedMonth, setFoundedMonth] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [tab, setTab] = useState("prospect"); // "prospect" | "companies"
  const [searchClicked, setSearchClicked] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const [showHeaderInput, setShowHeaderInput] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const headerInputRef = useRef(null);

  // Load companies from backend API
  const [companies, setCompanies] = useState([]);

  // Job title inline editing state
  const [editingJobTitleId, setEditingJobTitleId] = useState(null);
  const [editingJobTitleValue, setEditingJobTitleValue] = useState("");

  // Fetch leads from backend API with applied filters and search terms
  const fetchLeads = async () => {
    try {
      const filters = {};

      if (industry) filters.industry = industry;
      if (location) filters.location = location;
      if (size) filters.companySize = size;
      if (revenue) filters.revenue = revenue;

      // Uses quickSearch for general text filtering, or jobTitle for prospect tab search
      const searchParam = quickSearch || (searchClicked ? jobTitle : "");

      const response = await leadsService.getLeads(searchParam, filters);
      if (response && response.leads) {
        setCompanies(response.leads);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setCompanies([]);
    }
  };

  // Load data when search clicked or filters change
  useEffect(() => {
    if (searchClicked) {
      fetchLeads();
    }
  }, [searchClicked, quickSearch, industry, location, size, revenue]);

  // Additional frontend filtering of fields not supported by backend API
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (tab === "prospect") {
        if (jobTitle && !c.jobTitle?.toLowerCase().includes(jobTitle.toLowerCase()))
          return false;

        if (skills) {
          const skillArr = skills.toLowerCase().split(",").map((s) => s.trim());
          const companySkills = (c.skills || "").toLowerCase().split(",").map(s => s.trim());
          const hasAll = skillArr.every((s) => companySkills.includes(s));
          if (!hasAll) return false;
        }

        if (
          specialties &&
          !(c.specialties || "").toLowerCase().includes(specialties.toLowerCase())
        )
          return false;

        return true;
      } else {
        // For companies tab, rely on backend filters
        return true;
      }
    });
  }, [companies, jobTitle, skills, specialties, tab]);

  // Search button handler
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchClicked(true);
  };

  // Other UI handlers for header input and reset
  const handleHeaderMouseEnter = () => {
    setHeaderHovered(true);
    setShowHeaderInput(true);
  };

  const handleHeaderMouseLeave = () => {
    setHeaderHovered(false);
    setTimeout(() => {
      if (document.activeElement !== headerInputRef.current) setShowHeaderInput(false);
    }, 100);
  };

  const handleHeaderClick = () => {
    setShowHeaderInput(true);
    setTimeout(() => headerInputRef.current && headerInputRef.current.focus(), 0);
  };

  const handleReset = () => {
    setJobTitle("");
    setLocation("");
    setIndustry("");
    setSkills("");
    setSize("");
    setRevenue("");
    setSpecialties("");
    setCompanyTitle("");
    setCompanyLocation("");
    setFoundedDay("");
    setFoundedMonth("");
    setFoundedYear("");
    setSearchClicked(false);
    setCompanies([]);
  };

  // Inline job title edit helpers
  const startEditingJobTitle = (id, current) => {
    setEditingJobTitleId(id);
    setEditingJobTitleValue(current || "");
  };

  const cancelJobTitleEdit = () => {
    setEditingJobTitleId(null);
    setEditingJobTitleValue("");
  };

  // Save job title edit to backend API and update state
  const saveJobTitleEdit = async (id) => {
    const trimmed = (editingJobTitleValue || "").trim();
    if (!trimmed) {
      cancelJobTitleEdit();
      return;
    }
    try {
      await leadsService.updateLead(id, { jobTitle: trimmed });
      setCompanies((prev) =>
        prev.map((p) => (p.id === id ? { ...p, jobTitle: trimmed } : p))
      );
    } catch (error) {
      console.error("Failed to update jobTitle:", error);
    } finally {
      setEditingJobTitleId(null);
      setEditingJobTitleValue("");
    }
  };

  // Small helper component for form field rows with icons
  const FieldRow = ({ icon, label, hint, children }) => {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    const child = React.isValidElement(children) ? children : null;
    const childValue = child && child.props ? child.props.value : undefined;
    const hasValue =
      childValue !== undefined &&
      childValue !== null &&
      String(childValue).length > 0;

    const clonedChild = child
      ? React.cloneElement(child, {
        onFocus: (e) => {
          setFocused(true);
          if (child.props.onFocus) child.props.onFocus(e);
        },
        onBlur: (e) => {
          setFocused(false);
          if (child.props.onBlur) child.props.onBlur(e);
        },
        label: focused || hasValue ? label : null,
      })
      : children;

    const rowStyle = { ...styles.fieldRow };

    return (
      <div
        style={rowStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          style={{ ...styles.iconBox, ...(hovered ? styles.iconBoxHover : {}) }}
          aria-hidden
        >
          {icon}
        </div>
        <div style={styles.fieldBox}>
          {!focused && !hasValue && label && (
            <div style={styles.fieldBoxLabel}>{label}</div>
          )}
          {!focused && !hasValue && hint && (
            <div style={styles.fieldBoxHint}>{hint}</div>
          )}
          <div>{clonedChild}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerBar}>
        <div style={styles.headerButtons}>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Filters Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tabButton,
                ...(tab === "prospect" ? styles.tabButtonActive : {}),
              }}
              onClick={() => setTab("prospect")}
            >
              Prospect
            </button>
            <button
              style={{
                ...styles.tabButton,
                ...(tab === "companies" ? styles.tabButtonActive : {}),
              }}
              onClick={() => setTab("companies")}
            >
              Companies
            </button>
          </div>

          <form style={styles.filterCard} onSubmit={handleSearch}>
            <div style={styles.filterHeader}>
              <h3 style={styles.filterTitle}>Search Filter</h3>
              <div style={styles.loadSave}>Load&nbsp;|&nbsp;Save</div>
            </div>

            {tab === "companies" ? (
              <>
                <FieldRow
                  icon={
                    <img
                      src="/companyName.png"
                      alt="company title icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Company Title"
                  hint="Enter company title"
                >
                  <InputField
                    label={null}
                    placeholder="Enter company title"
                    value={companyTitle}
                    onChange={(e) => {
                      console.log("CompanyTitle input:", e.target.value);
                      setCompanyTitle(e.target.value);
                    }}
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/Founded.png"
                      alt="founded icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Founded"
                >
                  <div style={styles.foundedRow}>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={foundedDay}
                      onChange={(e) => {
                        console.log("FoundedDay input:", e.target.value);
                        setFoundedDay(e.target.value);
                      }}
                      style={styles.foundedInput}
                      placeholder="DD"
                    />
                    <select
                      value={foundedMonth}
                      onChange={(e) => {
                        console.log("FoundedMonth select:", e.target.value);
                        setFoundedMonth(e.target.value);
                      }}
                      style={styles.foundedSelect}
                    >
                      <option value="">Mon</option>
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={foundedYear}
                      onChange={(e) => {
                        console.log("FoundedYear input:", e.target.value);
                        setFoundedYear(e.target.value);
                      }}
                      style={styles.foundedInput}
                      placeholder="YYYY"
                    />
                  </div>
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/companyLocation.png"
                      alt="company location icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Company Location"
                  hint="Select company's location"
                >
                  <InputField
                    label={null}
                    placeholder="Select company's location"
                    value={companyLocation}
                    onChange={(e) => {
                      console.log("CompanyLocation input:", e.target.value);
                      setCompanyLocation(e.target.value);
                    }}
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/Industry.png"
                      alt="industry icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Industry"
                  hint="Select industry"
                >
                  <InputField
                    label={null}
                    placeholder="Select industry"
                    value={industry}
                    onChange={(e) => {
                      console.log("Industry input:", e.target.value);
                      setIndustry(e.target.value);
                    }}
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/Size.png"
                      alt="size icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Size"
                  hint="choose number of employees"
                >
                  <select
                    style={styles.input}
                    value={size}
                    onChange={(e) => {
                      console.log("Size select:", e.target.value);
                      setSize(e.target.value);
                    }}
                  >
                    <option value="">choose number of employees</option>
                    <option value="1-10">1-10</option>
                    <option value="10-50">10-50</option>
                    <option value="50-100">50-100</option>
                    <option value="100-200">100-200</option>
                    <option value="200-500">200-500</option>
                    <option value="500-1000">500-1000</option>
                  </select>
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="./Specialties.png"
                      alt="specialties icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Specialties"
                  hint="Select company's specialties"
                >
                  <InputField
                    label={null}
                    placeholder="Select company's specialties"
                    value={specialties}
                    onChange={(e) => {
                      console.log("Specialties input:", e.target.value);
                      setSpecialties(e.target.value);
                    }}
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/Revenue.png"
                      alt="revenue icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Revenue"
                  hint="Select company's revenue range"
                >
                  <select
                    style={styles.input}
                    value={revenue}
                    onChange={(e) => {
                      console.log("Revenue select:", e.target.value);
                      setRevenue(e.target.value);
                    }}
                  >
                    <option value="">Select company's revenue range</option>
                    <option value="0-20L">0-20L</option>
                    <option value="20L-50L">20L-50L</option>
                    <option value="50L-1Cr">50L-1Cr</option>
                    <option value="1Cr-5Cr">1Cr-5Cr</option>
                    <option value="5Cr-10Cr">5Cr-10Cr</option>
                  </select>
                </FieldRow>
              </>
            ) : (
              <>
                <FieldRow
                  icon={
                    <img
                      src="/JobTitle.png"
                      alt="job icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Job title"
                  hint="Enter one or more job title"
                >
                  <InputField
                    label={null}
                    placeholder="Enter one or more job title"
                    value={jobTitle}
                    onChange={(e) => {
                      console.log("JobTitle input:", e.target.value);
                      setJobTitle(e.target.value);
                    }}
                    required
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/prospectLocation.png"
                      alt="location icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Location"
                  hint="Select prospect's location"
                >
                  <InputField
                    label={null}
                    placeholder="Select prospect's location"
                    value={location}
                    onChange={(e) => {
                      console.log("Location input:", e.target.value);
                      setLocation(e.target.value);
                    }}
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/prospectIndustry.png"
                      alt="industry icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Industry"
                  hint="Select industry"
                >
                  <InputField
                    label={null}
                    placeholder="Select industry"
                    value={industry}
                    onChange={(e) => {
                      console.log("Industry input in prospect:", e.target.value);
                      setIndustry(e.target.value);
                    }}
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/prospectSkill.png"
                      alt="skills icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Skills"
                  hint="Enter prospect's expertise"
                >
                  <InputField
                    label={null}
                    placeholder="Enter prospect's expertise"
                    value={skills}
                    onChange={(e) => {
                      console.log("Skills input:", e.target.value);
                      setSkills(e.target.value);
                    }}
                  />
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/prospectSize.png"
                      alt="size icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Size"
                >
                  <select
                    style={styles.input}
                    value={size}
                    onChange={(e) => {
                      console.log("Size select in prospect:", e.target.value);
                      setSize(e.target.value);
                    }}
                  >
                    <option value="">choose number of employees</option>
                    <option value="1-10">1-10</option>
                    <option value="10-50">10-50</option>
                    <option value="50-100">50-100</option>
                    <option value="100-200">100-200</option>
                    <option value="200-500">200-500</option>
                    <option value="500-1000">500-1000</option>
                  </select>
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/prospectRevenue.png"
                      alt="revenue icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Revenue"
                >
                  <select
                    style={styles.input}
                    value={revenue}
                    onChange={(e) => {
                      console.log("Revenue select in prospect:", e.target.value);
                      setRevenue(e.target.value);
                    }}
                  >
                    <option value="">Select company's revenue range</option>
                    <option value="0-20L">0-20L</option>
                    <option value="20L-50L">20L-50L</option>
                    <option value="50L-1Cr">50L-1Cr</option>
                    <option value="1Cr-5Cr">1Cr-5Cr</option>
                    <option value="5Cr-10Cr">5Cr-10Cr</option>
                  </select>
                </FieldRow>

                <FieldRow
                  icon={
                    <img
                      src="/prospectSpecialties.png"
                      alt="specialties icon"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  }
                  label="Specialties"
                  hint="Select company's specialties"
                >
                  <InputField
                    label={null}
                    placeholder="Select company's specialties"
                    value={specialties}
                    onChange={(e) => {
                      console.log("Specialties input in prospect:", e.target.value);
                      setSpecialties(e.target.value);
                    }}
                  />
                </FieldRow>
              </>
            )}

            <div style={styles.buttonRowAlt}>
              <button type="submit" style={styles.primaryButtonAlt}>
                Search
              </button>
              <button type="button" style={styles.secondaryButtonAlt} onClick={handleReset}>
                Reset Filter
              </button>
            </div>
          </form>
        </div>
        <div style={{ ...styles.rightPanel }}>
          <div style={styles.resultsPanel}>


            {!searchClicked ? (
              <div style={styles.emptyStateContainer}>
                <div style={styles.illustrationContainer}>
                  <img
                    src="/databaseRightPanel.png"
                    alt="Database illustration"
                    style={{ ...styles.illustration, width: 350, height: 330, padding: -50 }}
                  />
                </div>

                <div style={styles.emptyStateContent}>
                  <h3 style={styles.emptyStateTitle}>Unlock targeted leads - apply filters and start your search!</h3>
                  <p style={styles.emptyStateSubtitle}>Select a filter to begin our search</p>

                  <div style={styles.suggestedFiltersContainer}>
                    <p style={styles.suggestedFiltersLabel}>Suggested filters:</p>
                    <div style={styles.suggestedFiltersGrid}>
                      <div style={styles.suggestionTag}>
                        <span style={styles.suggestionLabel}>Location:</span>
                        <span style={styles.suggestionValue}>Bangalore</span>
                      </div>
                      <div style={styles.suggestionTag}>
                        <span style={styles.suggestionLabel}>Job title:</span>
                        <span style={styles.suggestionValue}>Sales Manager</span>
                      </div>
                      <div style={styles.suggestionTag}>
                        <span style={styles.suggestionLabel}>Size:</span>
                        <span style={styles.suggestionValue}>100 - 200</span>
                      </div>
                    </div>
                  </div>

                  <button
                    style={styles.applyFilterButton}
                    onClick={() => {
                      setLocation("Bangalore");
                      setJobTitle("Sales Manager");
                      setSize("100-200");
                      setSearchClicked(true);
                    }}
                  >
                    Apply Search Filter
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={styles.resultHeader}>
                  <span style={{ fontWeight: 600 }}>Results ({filteredCompanies.length})</span>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    Tab: {tab === "prospect" ? "Prospect" : "Companies"}
                  </span>
                </div>

                {filteredCompanies.length === 0 && (
                  <p style={styles.infoText}>
                    No results found. Try removing some filters or changing your search.
                  </p>
                )}

                {filteredCompanies.length > 0 && (
                  <table style={styles.table}>
                    <thead>
                      {tab === "companies" ? (
                        <tr>
                          <th style={styles.th}>Company Name</th>
                          <th style={styles.th}>Company Title</th>
                          <th style={styles.th}>Company Location</th>
                          <th style={styles.th}>Founded</th>
                          <th style={styles.th}>Industry</th>
                          <th style={styles.th}>Size</th>
                          <th style={styles.th}>Specialties</th>
                          <th style={styles.th}>Revenue</th>
                        </tr>
                      ) : (
                        <tr>
                          <th style={styles.th}>Company</th>
                          <th style={styles.th}>Job Title</th>
                          <th style={styles.th}>Location</th>
                          <th style={styles.th}>Industry</th>
                          <th style={styles.th}>Skills</th>
                          <th style={styles.th}>Size</th>
                          <th style={styles.th}>Revenue</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {filteredCompanies.map((c) => (
                        <tr key={c.id}>
                          {tab === "companies" ? (
                            <>
                              <td style={styles.td}>{c.name}</td>
                              <td style={styles.td}>{c.companyTitle}</td>
                              <td style={styles.td}>{c.location}</td>
                              <td style={styles.td}>
                                <div style={styles.foundedRow}>
                                  <input
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={c.founded?.day ?? ""}
                                    onChange={(e) => {
                                      const day = e.target.value ? Number(e.target.value) : "";
                                      setCompanies((prev) =>
                                        prev.map((p) =>
                                          p.id === c.id
                                            ? {
                                              ...p,
                                              founded: { ...(p.founded || {}), day },
                                            }
                                            : p
                                        )
                                      );
                                    }}
                                    style={styles.foundedInput}
                                    placeholder="DD"
                                  />
                                  <select
                                    value={c.founded?.month ?? ""}
                                    onChange={(e) =>
                                      setCompanies((prev) =>
                                        prev.map((p) =>
                                          p.id === c.id
                                            ? {
                                              ...p,
                                              founded: { ...(p.founded || {}), month: e.target.value },
                                            }
                                            : p
                                        )
                                      )
                                    }
                                    style={styles.foundedSelect}
                                  >
                                    <option value="">Mon</option>
                                    {[
                                      "Jan",
                                      "Feb",
                                      "Mar",
                                      "Apr",
                                      "May",
                                      "Jun",
                                      "Jul",
                                      "Aug",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dec",
                                    ].map((m) => (
                                      <option key={m} value={m}>
                                        {m}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    min={1900}
                                    max={2100}
                                    value={c.founded?.year ?? ""}
                                    onChange={(e) => {
                                      const year = e.target.value ? Number(e.target.value) : "";
                                      setCompanies((prev) =>
                                        prev.map((p) =>
                                          p.id === c.id
                                            ? {
                                              ...p,
                                              founded: { ...(p.founded || {}), year },
                                            }
                                            : p
                                        )
                                      );
                                    }}
                                    style={styles.foundedInput}
                                    placeholder="YYYY"
                                  />
                                </div>
                              </td>
                              <td style={styles.td}>{c.industry}</td>
                              <td style={styles.td}>{(c.specialties || []).join(", ")}</td>
                              <td style={styles.td}>{c.revenue}</td>
                            </>
                          ) : (
                            <>
                              <td style={styles.td}>{c.name}</td>
                              <td style={styles.td}>
                                {editingJobTitleId === c.id ? (
                                  <div style={styles.inlineEditBox}>
                                    <input
                                      type="text"
                                      value={editingJobTitleValue}
                                      autoFocus
                                      onChange={(e) => {
                                        console.log("EditingJobTitleValue input:", e.target.value);
                                        setEditingJobTitleValue(e.target.value);
                                      }}
                                      // Removed onBlur save to prevent premature reset
                                      // onBlur={() => saveJobTitleEdit(c.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          saveJobTitleEdit(c.id);
                                        } else if (e.key === "Escape") {
                                          e.preventDefault();
                                          cancelJobTitleEdit();
                                        }
                                      }}
                                      style={styles.inlineInput}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={styles.inlineViewBox}
                                    onClick={() => startEditingJobTitle(c.id, c.jobTitle)}
                                    title="Click to edit"
                                  >
                                    {c.jobTitle}
                                  </div>
                                )}
                              </td>
                              <td style={styles.td}>{c.location}</td>
                              <td style={styles.td}>{c.industry}</td>
                              <td style={styles.td}>{(c.skills || "").split(",").join(", ")}</td>
                              <td style={styles.td}>{c.size}</td>
                              <td style={styles.td}>{c.revenue}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#f5f8fb",
    minHeight: "150vh",
  },
  headerBar: {
    height: 60,
    backgroundColor: "#00bcd4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    color: "#fff",
  },
  logo: {
    fontWeight: 700,
    letterSpacing: 1,
  },
  headerButtons: {
    display: "flex",
    gap: 12,
  },
  headerButton: {
    border: "none",
    borderRadius: 20,
    padding: "6px 14px",
    backgroundColor: "#fff",
    color: "#00bcd4",
    fontSize: 12,
    cursor: "pointer",
  },
  mainContent: {
    display: "flex",
    padding: 24,
    gap: 24,
    alignItems: "flex-start",
  },
  leftPanel: {
    width: 488,
  },
  rightPanel: {
    flex: 1,
    paddingLeft: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    justifyContent: "flex-start",
  },
  tabs: {
    display: "flex",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 999,
    padding: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  tabButton: {
    flex: 1,
    border: "none",
    borderRadius: 999,
    padding: "8px 0",
    fontSize: 13,
    cursor: "pointer",
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: "#00bcd4",
    color: "#fff",
    fontWeight: 600,
  },
  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    padding: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    width: 488,
    height: 680,
  },
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loadSave: {
    fontSize: 12,
    color: "#6b7280",
  },
  fieldRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 1,
    border: "1px solid #d9d9d9",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    width: 421,
    height: 69,
    boxSizing: "border-box",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxHover: {
    backgroundColor: "#ffffff",
    transition: "background-color 120ms ease-in-out",
  },
  fieldBox: {
    flex: 5,
    display: "flex",
    flexDirection: "column",
    gap: -20,
    justifyContent: "center",
    overflow: "hidden",
  },
  fieldBoxLabel: {
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    gap: -5,
  },
  fieldBoxHint: {
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  buttonRowAlt: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
  },
  primaryButtonAlt: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "none",
    backgroundColor: "#d1fae5",
    color: "#064e3b",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  secondaryButtonAlt: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid #d0d7e2",
    backgroundColor: "#fff",
    color: "#444",
    cursor: "pointer",
    fontSize: 14,
  },
  resultsPanel: {
    backgroundColor: "transparent",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "stretch",
  },
  title: {
    margin: 0,
    fontSize: 20,
    marginBottom: 1,
  },
  subtitle: {
    marginTop: 0,
    fontSize: 13,
    color: "#667085",
    marginBottom: 12,
  },
  emptyStateContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 40,
    boxShadow: "0 6px 18px rgba(16,24,40,0.03)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },
  illustrationContainer: {
    display: "flex",
    justifyContent: "left",
    alignItems: "left",
    width: "100%",
    minHeight: 220,
  },
  illustration: {
    maxWidth: "100%",
    height: "auto",
  },
  emptyStateContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  emptyStateTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    textAlign: "center",
  },
  emptyStateSubtitle: {
    margin: 0,
    fontSize: 14,
    color: "#667085",
    textAlign: "center",
  },
  suggestedFiltersContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  suggestedFiltersLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
  },
  suggestedFiltersGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  suggestionTag: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    border: "1px solid #bfdbfe",
    whiteSpace: "nowrap",
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#0c4a6e",
  },
  suggestionValue: {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: 500,
  },
  applyFilterButton: {
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#00bcd4",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 200ms ease-in-out",
    marginTop: 8,
    minWidth: 150,
  },
  resultsHeaderTop: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    position: "relative",
    backgroundColor: "#ffffff",
    border: "1px solid #e6edf5",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(16,24,40,0.03)",
  },
  titleInput: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 340,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d0d7e2",
    outline: "none",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  infoText: {
    fontSize: 13,
    color: "#555",
  },
  inlineViewBox: {
    padding: "5px 10px",
    borderRadius: 8,
    cursor: "pointer",
    backgroundColor: "#ffffff",
    border: "1px solid #d0d7e2",
    minHeight: 36,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  inlineEditBox: {
    padding: 0,
    borderRadius: 8,
    border: "1px solid #d0d7e2",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  inlineInput: {
    width: "100%",
    padding: "6px 8px",
    border: "none",
    outline: "none",
    fontSize: 13,
    boxSizing: "border-box",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
    fontSize: 12,
  },
  th: {
    textAlign: "left",
    padding: "8px 6px",
    borderBottom: "1px solid #dde3ef",
    backgroundColor: "#eef3ff",
  },
  td: {
    padding: "8px 6px",
    borderBottom: "1px solid #eef1f7",
  },
  foundedRow: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  foundedInput: {
    width: 56,
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #e6edf5",
    fontSize: 12,
    outline: "none",
  },
  foundedSelect: {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #e6edf5",
    fontSize: 12,
    outline: "none",
  },
};

export default DatabaseSearch;
