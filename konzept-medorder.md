# Konzept: Verbandmaterial-Bestellsystem für Pflegedienste

## 1. Übersicht

**Projektname:** MedOrder (Arbeitsname)
**Zweck:** Digitale Bestellplattform für Verbandmaterialien durch Pflegedienste bei einer Arztpraxis
**Zielgruppe:** Pflegedienste, Pflegeheime, Arztpraxis (Admin)

---

## 2. Funktionale Anforderungen

### 2.1 Benutzerrollen

| Rolle | Berechtigungen |
|-------|---------------|
| **Pflegeheim** | Einloggen, Patienten anlegen, Bestellungen aufgeben, eigene Bestellhistorie einsehen |
| **Praxis-Admin** | Sortiment pflegen (CRUD), Bestellungen einsehen, als "erledigt" markieren, Pflegeheime verwalten |

### 2.2 Pflegeheim-Funktionen

1. **Login/Logout**
   - Firmen-Login (eine Institution = ein Account)
   - Passwort-Reset via E-Mail
   - Session-Management (Auto-Logout nach Inaktivität)

2. **Patientenverwaltung**
   - Neue Patienten anlegen (Name + Geburtsdatum)
   - Patientenliste einsehen
   - Patienten deaktivieren/löschen (nur eigene)

3. **Bestellprozess**
   - Patient auswählen
   - Produkte nach Kategorien durchsuchen
   - Mengen auswählen
   - Warenkorb überprüfen
   - Bestellung absenden

4. **Bestellhistorie**
   - Eigene Bestellungen einsehen
   - Status (offen/erledigt) prüfen
   - Details anzeigen

### 2.3 Praxis-Admin-Funktionen

1. **Sortimentverwaltung**
   - Produkte anlegen/bearbeiten/löschen
   - Kategorien verwalten
   - Verfügbarkeit ein/ausschalten
   - Produktbilder hochladen (optional)

2. **Bestellverwaltung**
   - Alle Bestellungen einsehen
   - Nach Pflegeheim filtern
   - Nach Status filtern (offen/erledigt)
   - Als "erledigt" markieren
   - Bestelldetails exportieren (CSV/Excel)

3. **Pflegeheim-Verwaltung**
   - Neue Heime anlegen
   - Zugänge sperren/entsperren
   - Passwörter zurücksetzen

---

## 3. Datenmodell

### 3.1 Entitäten

```
CareHome (Pflegeheim)
├── id: UUID (PK)
├── name: String
├── email: String (unique)
├── passwordHash: String
├── contactPerson: String
├── phone: String
├── address: Text
├── isActive: Boolean
├── createdAt: DateTime
└── updatedAt: DateTime

Patient
├── id: UUID (PK)
├── careHomeId: UUID (FK)
├── firstName: String
├── lastName: String
├── dateOfBirth: Date
├── isActive: Boolean
├── createdAt: DateTime
└── updatedAt: DateTime

Category (Kategorie)
├── id: UUID (PK)
├── name: String
├── description: Text
├── sortOrder: Integer
├── isActive: Boolean
└── createdAt: DateTime

Product (Produkt)
├── id: UUID (PK)
├── categoryId: UUID (FK)
├── name: String
├── description: Text
├── articleNumber: String (optional)
├── unit: String (z.B. "Stück", "Packung", "Rolle")
├── isActive: Boolean
├── createdAt: DateTime
└── updatedAt: DateTime

Order (Bestellung)
├── id: UUID (PK)
├── careHomeId: UUID (FK)
├── patientId: UUID (FK)
├── orderNumber: String (z.B. "BM-20250206-001")
├── status: Enum [PENDING, COMPLETED]
├── totalItems: Integer
├── notes: Text (optional)
├── completedAt: DateTime
├── completedBy: String
├── createdAt: DateTime
└── updatedAt: DateTime

OrderItem (Bestellposition)
├── id: UUID (PK)
├── orderId: UUID (FK)
├── productId: UUID (FK)
├── quantity: Integer
├── productName: String (Snapshot)
└── productUnit: String (Snapshot)
```

---

## 4. Benutzeroberfläche

### 4.1 Pflegeheim-Bereich

**Dashboard**
- Schnellzugriff: Neue Bestellung
- Letzte Bestellungen (5 Stück)
- Offene Bestellungen

**Bestellung aufgeben (3 Schritte)**
1. **Patient wählen**
   - Dropdown: Vorhandene Patienten
   - Button: "Neuen Patienten anlegen"
   
2. **Produkte wählen**
   - Links: Kategorie-Navigation
   - Rechts: Produktliste mit Mengeneingabe
   - "In den Warenkorb" pro Produkt
   - Fixer Warenkorb (sticky, rechts oder unten)

3. **Überprüfen & Absenden**
   - Bestellübersicht
   - Patientendaten
   - Produktliste mit Mengen
   - Hinweistext-Feld (optional)
   - "Jetzt bestellen"-Button
   - Erfolgsmeldung mit Bestellnummer

**Meine Bestellungen**
- Tabelle: Bestellnummer, Datum, Patient, Status, Anzahl Artikel
- Filter: Zeitraum, Status
- Detailansicht pro Bestellung

### 4.2 Admin-Bereich (Praxis)

**Dashboard**
- Offene Bestellungen (Anzahl + Liste)
- Heutige Bestellungen
- Pflegeheime-Übersicht

**Bestellungen verwalten**
- Tabelle mit allen Bestellungen
- Status-Badges (offen/grün = erledigt)
- Filter: Pflegeheim, Status, Zeitraum
- Aktion: Als erledigt markieren
- Detailansicht mit Patientendaten

**Sortiment**
- Kategoriebaum
- Produkttabelle pro Kategorie
- CRUD-Operationen
- Drag & Drop für Sortierung

**Pflegeheime**
- Liste aller Heime
- Anlegen/Bearbeiten/Sperren
- Passwort-Reset-Funktion

---

## 5. Technische Architektur

### 5.1 Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Framework | Next.js 14+ (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Datenbank | PostgreSQL 15+ |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials + Email) |
| E-Mail | Nodemailer / SendGrid / Mailgun |
| Hosting | Hetzner Cloud (Deutschland) |
| SSL | Let's Encrypt |

### 5.2 Sicherheitsmaßnahmen

1. **Transport**
   - HTTPS enforced (HSTS)
   - TLS 1.3

2. **Authentifizierung**
   - bcrypt für Passwörter (cost factor 12+)
   - CSRF-Protection
   - Rate Limiting (Login-Versuche)
   - Session-Timeout nach 30 Min Inaktivität

3. **Datenbank**
   - Verschlüsselung bei Ruhe (TDE)
   - Gesundheitsdaten zusätzlich verschlüsselt (AES-256)
   - Backups verschlüsselt

4. **Zugriffskontrolle**
   - Rollenbasierte Berechtigungen
   - Pflegeheim sieht nur eigene Daten
   - Admin sieht alles

5. **Logging**
   - Login/Logout-Protokollierung
   - Bestellaktionen protokolliert
   - Keine Passwörter in Logs

### 5.3 Datenschutz (DSGVO)

**Zu "Löschfristen für Patientendaten":**
Das bedeutet: Nach welcher Zeit werden Patientendaten automatisch gelöscht?
- Option A: Nach X Jahren automatisch löschen
- Option B: Patienten anonymisieren (Name → "Patient-ID-12345")
- Option C: Manuelle Löschung durch Admin nach Behandlungsende

**Empfohlen:** Option C mit einer Empfehlung: Patienten nach Behandlungsende deaktivieren (nicht mehr bestellbar), nach X Jahren automatisch löschen.

---

## 6. E-Mail-Benachrichtigungen

### 6.1 Bestellbestätigung (an Praxis)

**Empfänger:** Praxis-E-Mail
**Betreff:** Neue Bestellung #{orderNumber} von {careHomeName}

**Inhalt (HTML):**
- Header: Logo + "Neue Bestellung eingegangen"
- Bestelldetails: Nummer, Datum, Pflegeheim
- Patient: Name, Geburtsdatum
- Produktliste: Tabelle mit Artikel, Menge, Einheit
- Hinweistext (falls vorhanden)
- Footer: Link zur Weboberfläche

### 6.2 Passwort-Reset

**Empfänger:** Pflegeheim-E-Mail
**Betreff:** Passwort zurücksetzen

**Inhalt:**
- Reset-Link (24h gültig)
- Hinweis: Link nicht weitergeben

---

## 7. Nicht-funktionale Anforderungen

| Aspekt | Anforderung |
|--------|-------------|
| Verfügbarkeit | 99% Uptime (keine kritische Infrastruktur) |
| Performance | Seiten laden < 2 Sekunden |
| Browser | Chrome, Firefox, Safari, Edge (letzte 2 Versionen) |
| Mobile | Responsive Design (Tablets primär) |
| Barrierefreiheit | WCAG 2.1 Level AA (Empfehlung) |

---

## 8. Implementierungsphasen

### Phase 1: MVP (2-3 Wochen)
- Grundgerüst (Next.js, DB, Auth)
- Login für Pflegeheime
- Produktkatalog (statisch)
- Einfacher Bestellprozess
- E-Mail-Benachrichtigung

### Phase 2: Admin-Funktionen (1-2 Wochen)
- Admin-Login
- Sortiment-Pflege
- Bestellverwaltung
- "Erledigt"-Markierung

### Phase 3: Erweiterungen (optional)
- Patienten-Historie
- Bestellvorlagen
- Mehrere Empfänger in Praxis
- Export-Funktionen
- Produktbilder

---

## 9. Offene Fragen

1. **Löschfristen:** Wie lange sollen Patientendaten gespeichert werden? (Empfehlung: 3 Jahre nach letzter Bestellung, dann automatische Anonymisierung)

2. **E-Mail-Empfänger:** An welche E-Mail-Adresse(n) der Praxis gehen die Bestellungen?

3. **Mehrere Praxen:** Soll das System skalierbar sein für mehrere Praxen (Multi-Tenant) oder ist es eine Einzelinstallation?

4. **Bestellnummern-Schema:** Soll es ein spezielles Format geben? (z.B. "BM-2025-0001")

5. **Berechtigungen innerhalb des Pflegeheims:** Soll es Rollen geben (z.B. nur Bestellung aufgeben vs. auch Patienten anlegen)?

6. **Wochenenden/Feiertage:** Sollen Bestellungen an bestimmten Tagen eingegrenzt werden?

---

## 10. Kostenschätzung (Groborientierung)

| Posten | Kosten |
|--------|--------|
| Entwicklung (MVP) | 40-60h |
| Hosting/Monat | 10-30€ |
| Domain/Jahr | 10-20€ |
| E-Mail-Versand | 0-10€/Monat |
| SSL-Zertifikat | 0€ (Let's Encrypt) |

---

*Konzept erstellt am: 2025-02-06*
