import Head from "next/head";
import clients from "../../data/clients.json";
import styles from "../../styles/profile.module.css";

export async function getStaticPaths() {
  const paths = clients.map((c) => ({ params: { slug: c.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const client = clients.find((c) => c.slug === params.slug) || null;
  return { props: { client } };
}

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateVCard(c) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${c.name}`,
    c.title ? `TITLE:${c.title}` : "",
    c.company ? `ORG:${c.company}` : "",
    c.phone ? `TEL;TYPE=CELL:${c.phone}` : "",
    c.email ? `EMAIL:${c.email}` : "",
    c.website ? `URL:${c.website}` : "",
    c.telegram ? `X-SOCIALPROFILE;type=telegram:https://t.me/${c.telegram}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
  return lines;
}

export default function ProfilePage({ client }) {
  if (!client) return <div>Не найдено</div>;

  const accent = client.accent || "#6366f1";

  function handleSaveContact() {
    const vcf = generateVCard(client);
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${client.slug}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const contactLinks = [
    client.phone && {
      icon: "phone",
      label: client.phone,
      href: `tel:${client.phone.replace(/\s/g, "")}`,
    },
    client.email && {
      icon: "email",
      label: client.email,
      href: `mailto:${client.email}`,
    },
    client.telegram && {
      icon: "telegram",
      label: `@${client.telegram}`,
      href: `https://t.me/${client.telegram}`,
    },
    client.instagram && {
      icon: "instagram",
      label: `@${client.instagram}`,
      href: `https://instagram.com/${client.instagram}`,
    },
    client.website && {
      icon: "web",
      label: client.website.replace(/^https?:\/\//, ""),
      href: client.website,
    },
  ].filter(Boolean);

  const icons = {
    phone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.72a16 16 0 006.29 6.29l1.08-1.34a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    email: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    telegram: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.972 14.6l-2.963-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.847.986z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    web: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  };

  return (
    <>
      <Head>
        <title>{client.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={`${client.title} · ${client.company}`} />
      </Head>

      <div className={styles.page}>
        <div className={styles.card}>
          {/* Header strip */}
          <div className={styles.header} style={{ "--accent": accent }}>
            <div className={styles.avatar} style={{ "--accent": accent }}>
              {client.photo ? (
                <img src={client.photo} alt={client.name} />
              ) : (
                <span>{initials(client.name)}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className={styles.body}>
            <h1 className={styles.name}>{client.name}</h1>
            {(client.title || client.company) && (
              <p className={styles.meta}>
                {client.title}
                {client.title && client.company && " · "}
                {client.company}
              </p>
            )}

            {/* Contact links */}
            {contactLinks.length > 0 && (
              <ul className={styles.links}>
                {contactLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={link.icon !== "phone" && link.icon !== "email" ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className={styles.link}
                      style={{ "--accent": accent }}
                    >
                      <span className={styles.linkIcon}>{icons[link.icon]}</span>
                      <span className={styles.linkLabel}>{link.label}</span>
                      <span className={styles.linkArrow}>→</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {/* Save button */}
            <button
              className={styles.saveBtn}
              style={{ "--accent": accent }}
              onClick={handleSaveContact}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Сохранить контакт
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
