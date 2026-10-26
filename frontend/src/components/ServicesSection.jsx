import { useState } from "react";
import { SERVICE_CATALOG } from "../services/serviceCatalog";

const SERVICE_ICONS = ["✳", "☁", "✉", "◈", "◇", "✦"];

function ServicesSection({ services, loading, error, onSelectService }) {
  const [expandedService, setExpandedService] = useState(null);

  if (loading) {
    return (
      <section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <span className="section-kicker">WHAT WE OFFER</span>
            <h2>Explore our services</h2>
            <p>Practical cloud support to help you take your next business step.</p>
          </div>
        </div>

        <div className="services-status" role="status">
          Loading available services
          <span className="loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="services-section" id="services">
        <div className="section-heading">
          <div>
            <span className="section-kicker">WHAT WE OFFER</span>
            <h2>Explore our services</h2>
          </div>
        </div>

        <div className="services-status services-error" role="alert">
          {error}
        </div>
      </section>
    );
  }

  // Use rich catalog entries or fallback to incoming services
  const listToRender = SERVICE_CATALOG;

  return (
    <section className="services-section" id="services">
      <div className="section-heading">
        <div>
          <span className="section-kicker">WHAT WE OFFER</span>
          <h2>Explore our services</h2>
          <p>
            Find the support you need to plan, improve, and grow your business with transparent pricing.
          </p>
        </div>

        <span className="service-count">
          {listToRender.length} {listToRender.length === 1 ? "service" : "services"}
        </span>
      </div>

      <div className="services-grid">
        {listToRender.map((service, index) => {
          const serviceId = service.id;
          const serviceName = service.name;
          const serviceDescription = service.short_description || service.description;
          const isExpanded = expandedService === serviceId;

          return (
            <article
              className={`service-card${isExpanded ? " expanded" : ""}`}
              key={serviceId}
            >
              <div className="service-icon" aria-hidden="true">
                {SERVICE_ICONS[index % SERVICE_ICONS.length]}
              </div>

              <h3>{serviceName}</h3>
              <p>{serviceDescription}</p>

              {/* Published Base Price */}
              <div className="service-card-pricing">
                <span className="price-tag-value">{service.price_display}</span>
                <span className="price-tag-cycle">/ {service.renewal_period.toLowerCase()}</span>
              </div>

              {isExpanded && (
                <div className="service-extra">
                  <strong>Key Capabilities:</strong>
                  <ul className="service-extra-list">
                    {service.features.slice(0, 3).map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="service-card-bottom-actions">
                <button
                  type="button"
                  className="btn-view-service-details"
                  onClick={() => onSelectService && onSelectService(service.slug)}
                >
                  View More Details →
                </button>

                <button
                  type="button"
                  className="service-link"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedService((current) =>
                      current === serviceId ? null : serviceId
                    )
                  }
                >
                  {isExpanded ? "Show less" : "Quick preview"}
                  <span aria-hidden="true">{isExpanded ? "↑" : "↓"}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ServicesSection;
