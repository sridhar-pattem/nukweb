# RDA Catalogue Upgrade Design Document

**Version:** 1.0
**Date:** 2025-11-17
**Status:** Design Proposal

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [RDA Overview](#rda-overview)
3. [Current Schema Analysis](#current-schema-analysis)
4. [Proposed RDA Schema Design](#proposed-rda-schema-design)
5. [Core RDA Elements Mapping](#core-rda-elements-mapping)
6. [Database Migration Strategy](#database-migration-strategy)
7. [API Changes Required](#api-changes-required)
8. [Frontend Changes Required](#frontend-changes-required)
9. [Implementation Phases](#implementation-phases)
10. [Backward Compatibility](#backward-compatibility)

---

## 1. Executive Summary

This document outlines the design for upgrading the library catalogue system from a flat, simplified metadata model to a **Resource Description and Access (RDA)** compliant structure based on the **WEMI (Work-Expression-Manifestation-Item)** model.

### Key Changes

- **Structural**: Transform from flat `books` table to WEMI entity hierarchy
- **Metadata**: Implement RDA core elements for proper bibliographic description
- **Relationships**: Establish proper relationships between Works, Expressions, Manifestations, and Items
- **Standards Compliance**: Align with IFLA Library Reference Model (LRM)

### Benefits

- **Professional Standards**: Align with international cataloging standards used by major libraries
- **Better Organization**: Separate intellectual content from physical instances
- **Enhanced Discovery**: Support for multiple editions, translations, and formats of the same work
- **Future-Ready**: Prepare for linked data and semantic web integration
- **Interoperability**: Enable metadata sharing with other RDA-compliant systems

---

## 2. RDA Overview

### What is RDA?

**Resource Description and Access (RDA)** is the international standard for descriptive cataloging, replacing AACR2 (Anglo-American Cataloguing Rules, 2nd Edition). It was released in 2010 and is based on the **FRBR (Functional Requirements for Bibliographic Records)** conceptual model.

### WEMI Model (FRBR Group 1 Entities)

The foundation of RDA is the WEMI model, which recognizes four distinct entities:

```
┌─────────────────────────────────────────────────────────────┐
│ WORK (Intellectual/Artistic Content)                        │
│ • The abstract concept of a creative work                   │
│ • Example: "Pride and Prejudice" by Jane Austen             │
│ • Core attributes: title, creator, form, date              │
└───────────────────┬─────────────────────────────────────────┘
                    │ is realized through
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ EXPRESSION (Realization of Work)                            │
│ • A specific intellectual/artistic realization              │
│ • Example: English text version / Spanish translation       │
│ • Core attributes: language, content type, date            │
└───────────────────┬─────────────────────────────────────────┘
                    │ is embodied in
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ MANIFESTATION (Physical Embodiment)                         │
│ • The physical or digital publication                       │
│ • Example: 2003 Penguin Classics paperback edition         │
│ • Core attributes: publisher, pub date, ISBN, extent       │
└───────────────────┬─────────────────────────────────────────┘
                    │ is exemplified by
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ ITEM (Single Physical/Digital Instance)                     │
│ • Individual copy owned by the library                      │
│ • Example: Barcode 000123456, on shelf A-123               │
│ • Core attributes: identifier, location, condition         │
└─────────────────────────────────────────────────────────────┘
```

### RDA Core Elements

RDA defines three levels of core elements:

1. **RDA Core**: Always required
2. **RDA Core if**: Required if applicable/available
3. **LC-PCC Core**: Additional elements required by Library of Congress/PCC

---

## 3. Current Schema Analysis

### Current Flat Structure

The existing system uses a single `books` table mixing all WEMI levels:

```sql
books (
  book_id              -- Acts as both manifestation and work ID
  isbn                 -- MANIFESTATION level
  title                -- WORK level
  author               -- WORK level (creator)
  genre                -- WORK level
  publisher            -- MANIFESTATION level
  publication_year     -- MANIFESTATION level
  total_copies         -- ITEM level (aggregated)
  available_copies     -- ITEM level (aggregated)
  status               -- ITEM level
  ...
)
```

### Problems with Current Structure

| Issue | Impact | RDA Solution |
|-------|--------|--------------|
| **Mixed abstraction levels** | Can't distinguish between work and manifestation | Separate WEMI entities |
| **No multi-edition support** | Each edition creates duplicate work metadata | Work entity shared by multiple manifestations |
| **No translation tracking** | Translations treated as separate works | Expression entity for language/version |
| **Limited creator attribution** | Single `author` field | Proper agent relationships with roles |
| **No content type standardization** | Genre is free text | RDA content/media/carrier type vocabularies |
| **Copy management issues** | Aggregate counts instead of individual items | Individual item records |

---

## 4. Proposed RDA Schema Design

### Entity-Relationship Diagram

```
┌──────────────┐      realizes       ┌──────────────┐
│    WORKS     │◄────────────────────│  EXPRESSIONS │
└──────┬───────┘                     └──────┬───────┘
       │                                    │
       │ created_by                         │ embodied_in
       │                                    │
       ▼                                    ▼
┌──────────────┐                    ┌──────────────┐
│    AGENTS    │                    │MANIFESTATIONS│
│  (Creators)  │◄───published_by────│              │
└──────────────┘                    └──────┬───────┘
                                           │
                                           │ exemplified_by
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │    ITEMS     │
                                    └──────────────┘
```

### 4.1 Works Table

The **Work** represents the abstract intellectual or artistic content.

```sql
CREATE TABLE works (
  work_id SERIAL PRIMARY KEY,

  -- Title of Work (RDA 6.2 - Core)
  preferred_title VARCHAR(500) NOT NULL,
  variant_titles TEXT[],  -- Array of alternative titles

  -- Form of Work (RDA 6.3)
  form_of_work VARCHAR(100),  -- novel, poem, essay, etc.

  -- Date of Work (RDA 6.4)
  date_of_work VARCHAR(100),  -- Can be approximate: "1813", "ca. 1600"

  -- Place of Origin (RDA 6.5)
  place_of_origin VARCHAR(255),

  -- Other Distinguishing Characteristics (RDA 6.6)
  distinguishing_characteristic TEXT,

  -- History of Work (RDA 7.18)
  history_of_work TEXT,

  -- Nature of Content (RDA 7.2 - LC Core)
  nature_of_content VARCHAR(100)[],  -- fiction, non-fiction, biography, etc.

  -- Intended Audience (RDA 7.7 - Core if)
  intended_audience VARCHAR(100),  -- general, juvenile, adolescent, etc.

  -- Subject (not in RDA core but important for discovery)
  subjects TEXT[],  -- Array of subject headings

  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Metadata tracking
  cataloging_source VARCHAR(50),  -- Who created this record
  last_modified_by VARCHAR(50)
);

CREATE INDEX idx_works_preferred_title ON works(preferred_title);
CREATE INDEX idx_works_form ON works(form_of_work);
```

### 4.2 Expressions Table

The **Expression** represents a specific realization of a work (language, version, etc.).

```sql
CREATE TABLE expressions (
  expression_id SERIAL PRIMARY KEY,
  work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,

  -- Content Type (RDA 6.9 - Core)
  content_type VARCHAR(100) NOT NULL,  -- text, spoken word, performed music, etc.

  -- Language of Expression (RDA 6.11 - Core)
  language_of_expression VARCHAR(10) NOT NULL,  -- ISO 639-2/B codes: 'eng', 'spa', 'fre'
  additional_languages VARCHAR(10)[],  -- For multilingual works

  -- Date of Expression (RDA 6.10)
  date_of_expression VARCHAR(100),

  -- Other Distinguishing Characteristics
  expression_characteristic TEXT,

  -- Summarization of Content (RDA 7.10)
  summarization_of_content TEXT,  -- Abstract or summary

  -- Supplementary Content (RDA 7.16 - Core if)
  supplementary_content VARCHAR(255)[],  -- index, bibliography, appendix, etc.

  -- Illustrative Content (RDA 7.15 - Core if)
  illustrative_content VARCHAR(100)[],  -- illustrations, maps, charts, etc.

  -- Colour Content (RDA 7.17)
  colour_content VARCHAR(50),  -- black and white, color, etc.

  -- Duration (RDA 7.22 - Core for audio/video)
  duration VARCHAR(50),  -- For audiobooks, videos

  -- Accessibility Content (RDA 7.14)
  accessibility_content VARCHAR(100)[],  -- closed captions, audio description, etc.

  -- Translator/Editor relationships (stored in work_expression_agent table)

  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_work_language_content UNIQUE(work_id, language_of_expression, content_type)
);

CREATE INDEX idx_expressions_work_id ON expressions(work_id);
CREATE INDEX idx_expressions_language ON expressions(language_of_expression);
CREATE INDEX idx_expressions_content_type ON expressions(content_type);
```

### 4.3 Manifestations Table

The **Manifestation** represents a physical or digital publication.

```sql
CREATE TABLE manifestations (
  manifestation_id SERIAL PRIMARY KEY,
  expression_id INTEGER NOT NULL REFERENCES expressions(expression_id) ON DELETE CASCADE,

  -- Title of Manifestation (RDA 2.3 - Core)
  title_proper VARCHAR(500) NOT NULL,
  parallel_title_proper VARCHAR(500)[],  -- Titles in other languages
  other_title_information TEXT,  -- Subtitle

  -- Statement of Responsibility (RDA 2.4 - Core)
  statement_of_responsibility TEXT,  -- "by Jane Austen ; edited by John Smith"

  -- Edition Statement (RDA 2.5 - Core if)
  edition_statement VARCHAR(255),  -- "2nd edition", "Revised edition"

  -- Publication Statement (RDA 2.8 - Core)
  place_of_publication VARCHAR(255),
  publisher_name VARCHAR(255),
  date_of_publication VARCHAR(100),  -- Can be copyright date if pub date unknown

  -- Copyright Date (RDA 2.11 - Core if)
  copyright_date VARCHAR(100),

  -- Series Statement (RDA 2.12)
  series_statement VARCHAR(500),

  -- Media Type (RDA 3.2 - LC Core)
  media_type VARCHAR(100) NOT NULL,  -- unmediated, audio, video, computer, microform

  -- Carrier Type (RDA 3.3 - Core)
  carrier_type VARCHAR(100) NOT NULL,  -- volume, audio disc, videodisc, online resource

  -- Extent (RDA 3.4 - Core)
  extent VARCHAR(255),  -- "328 pages", "1 audio disc (2 hr., 30 min.)"

  -- Dimensions (RDA 3.5 - Core if)
  dimensions VARCHAR(100),  -- "23 cm", "12 cm diameter"

  -- Identifiers (RDA 2.15 - Core)
  isbn VARCHAR(13),
  isbn_10 VARCHAR(10),
  issn VARCHAR(9),  -- For serials
  other_identifier VARCHAR(255),  -- Publisher number, LCCN, etc.

  -- Note on Manifestation (RDA 2.17)
  notes TEXT[],

  -- Digital Resources
  mode_of_issuance VARCHAR(50),  -- single unit, multipart monograph, serial, integrating resource
  digital_file_characteristic TEXT,
  digital_representation VARCHAR(100),
  url TEXT,  -- For online resources

  -- Cover Image (not in RDA but useful)
  cover_image_url TEXT,
  thumbnail_url TEXT,

  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Soft delete support
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_manifestations_expression_id ON manifestations(expression_id);
CREATE INDEX idx_manifestations_isbn ON manifestations(isbn);
CREATE INDEX idx_manifestations_publisher ON manifestations(publisher_name);
CREATE INDEX idx_manifestations_title ON manifestations(title_proper);
CREATE INDEX idx_manifestations_date ON manifestations(date_of_publication);
```

### 4.4 Items Table

The **Item** represents individual physical or digital copies owned by the library.

```sql
CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  manifestation_id INTEGER NOT NULL REFERENCES manifestations(manifestation_id) ON DELETE CASCADE,

  -- Item Identifier (RDA 2.18 - Core)
  barcode VARCHAR(50) UNIQUE,
  call_number VARCHAR(100),

  -- Custodial History (RDA 2.19)
  custodial_history TEXT,
  immediate_source_of_acquisition TEXT,

  -- Condition (RDA 2.20)
  condition_of_item VARCHAR(50),  -- excellent, good, fair, poor, damaged
  condition_notes TEXT,

  -- Location
  collection_id INTEGER REFERENCES collections(collection_id),
  shelf_location VARCHAR(100),

  -- Circulation Status
  circulation_status VARCHAR(50) NOT NULL DEFAULT 'available',
  -- Values: available, checked_out, on_hold, in_transit, on_order,
  --         lost, missing, damaged, withdrawn, non_circulating

  -- Circulation Policy
  circulation_policy VARCHAR(50),  -- normal, reference_only, restricted, etc.
  loan_period_days INTEGER DEFAULT 14,
  renewable BOOLEAN DEFAULT TRUE,
  max_renewals INTEGER DEFAULT 2,

  -- Restriction on Use (RDA 4.4)
  restriction_on_use TEXT,

  -- Acquisition Information
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  acquisition_source VARCHAR(255),

  -- Age Rating (local extension)
  age_rating VARCHAR(50),

  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Soft delete for withdrawn items
  is_withdrawn BOOLEAN DEFAULT FALSE,
  withdrawn_at TIMESTAMP,
  withdrawn_reason TEXT
);

CREATE INDEX idx_items_manifestation_id ON items(manifestation_id);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_call_number ON items(call_number);
CREATE INDEX idx_items_collection_id ON items(collection_id);
CREATE INDEX idx_items_circulation_status ON items(circulation_status);
```

### 4.5 Agents Table (Creators, Contributors)

RDA treats creators and contributors as **Agents** (persons, families, or corporate bodies).

```sql
CREATE TABLE agents (
  agent_id SERIAL PRIMARY KEY,

  -- Agent Type
  agent_type VARCHAR(20) NOT NULL,  -- person, family, corporate_body

  -- Preferred Name (RDA 9.2.2 - Core)
  preferred_name VARCHAR(500) NOT NULL,
  variant_names TEXT[],

  -- Dates (RDA 9.3 - Core for persons)
  date_of_birth VARCHAR(50),
  date_of_death VARCHAR(50),
  period_of_activity VARCHAR(100),  -- For corporate bodies

  -- Title of Person (RDA 9.4)
  title_of_person VARCHAR(100),  -- Dr., Sir, etc.

  -- Gender (RDA 9.7)
  gender VARCHAR(50),

  -- Profession/Occupation (RDA 9.16)
  profession_or_occupation VARCHAR(255)[],

  -- Field of Activity (RDA 9.15)
  field_of_activity VARCHAR(255)[],

  -- Associated Institution (for corporate bodies)
  associated_institution VARCHAR(255),

  -- Identifiers
  authority_id VARCHAR(100),  -- VIAF, LCNAF, ISNI, etc.
  authority_source VARCHAR(50),  -- LCNAF, VIAF, etc.

  -- Biographical Information
  biographical_information TEXT,

  -- System fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agents_preferred_name ON agents(preferred_name);
CREATE INDEX idx_agents_type ON agents(agent_type);
CREATE INDEX idx_agents_authority_id ON agents(authority_id);
```

### 4.6 Relationship Tables

RDA emphasizes relationships between entities.

#### Work-Agent Relationships

```sql
CREATE TABLE work_agent_relationships (
  relationship_id SERIAL PRIMARY KEY,
  work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,

  -- RDA Relationship Designator (Appendix I)
  relationship_role VARCHAR(100) NOT NULL,
  -- Examples: author, illustrator, editor, translator, composer,
  --           photographer, filmmaker, etc.

  -- Role specificity
  role_note TEXT,

  -- Sequence (for multiple creators)
  sequence_number INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_work_agent_role UNIQUE(work_id, agent_id, relationship_role)
);

CREATE INDEX idx_work_agent_work_id ON work_agent_relationships(work_id);
CREATE INDEX idx_work_agent_agent_id ON work_agent_relationships(agent_id);
CREATE INDEX idx_work_agent_role ON work_agent_relationships(relationship_role);
```

#### Expression-Agent Relationships

```sql
CREATE TABLE expression_agent_relationships (
  relationship_id SERIAL PRIMARY KEY,
  expression_id INTEGER NOT NULL REFERENCES expressions(expression_id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,

  -- RDA Relationship Designator
  relationship_role VARCHAR(100) NOT NULL,
  -- Examples: translator, narrator, performer, editor, etc.

  role_note TEXT,
  sequence_number INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_expression_agent_role UNIQUE(expression_id, agent_id, relationship_role)
);

CREATE INDEX idx_expression_agent_expression_id ON expression_agent_relationships(expression_id);
CREATE INDEX idx_expression_agent_agent_id ON expression_agent_relationships(agent_id);
```

#### Manifestation-Agent Relationships

```sql
CREATE TABLE manifestation_agent_relationships (
  relationship_id SERIAL PRIMARY KEY,
  manifestation_id INTEGER NOT NULL REFERENCES manifestations(manifestation_id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,

  -- RDA Relationship Designator
  relationship_role VARCHAR(100) NOT NULL,
  -- Examples: publisher, manufacturer, distributor, book_designer, etc.

  role_note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_manifestation_agent_role UNIQUE(manifestation_id, agent_id, relationship_role)
);

CREATE INDEX idx_manifestation_agent_manifestation_id ON manifestation_agent_relationships(manifestation_id);
CREATE INDEX idx_manifestation_agent_agent_id ON manifestation_agent_relationships(agent_id);
```

#### Work-to-Work Relationships

```sql
CREATE TABLE work_relationships (
  relationship_id SERIAL PRIMARY KEY,
  source_work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
  target_work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,

  -- RDA Relationship Designator (Appendix J)
  relationship_type VARCHAR(100) NOT NULL,
  -- Examples: adaptation_of, sequel_to, prequel_to, based_on,
  --           parody_of, translation_of, etc.

  relationship_note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_work_relationship UNIQUE(source_work_id, target_work_id, relationship_type),
  CONSTRAINT prevent_self_reference CHECK (source_work_id != target_work_id)
);

CREATE INDEX idx_work_relationships_source ON work_relationships(source_work_id);
CREATE INDEX idx_work_relationships_target ON work_relationships(target_work_id);
```

### 4.7 RDA Vocabulary Tables

RDA uses controlled vocabularies for many elements.

```sql
-- Content Types (RDA 6.9)
CREATE TABLE rda_content_types (
  content_type_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  definition TEXT,
  rda_reference VARCHAR(50)
);

-- Insert standard RDA content types
INSERT INTO rda_content_types (code, label, definition) VALUES
('txt', 'text', 'Content expressed through a form of notation for language'),
('spw', 'spoken word', 'Content expressed through language in an audible form'),
('prm', 'performed music', 'Content expressed through music in an audible form'),
('ntm', 'notated music', 'Content expressed through a form of musical notation'),
('sti', 'still image', 'Content expressed through line, shape, shading, etc.'),
('tdi', 'two-dimensional moving image', 'Content expressed through moving images'),
('cri', 'cartographic image', 'Content expressed through images representing the Earth or other celestial bodies'),
('crt', 'cartographic three-dimensional form', 'Content expressed through a form intended to be perceived as three-dimensional'),
('tdf', 'three-dimensional form', 'Content expressed through a form intended to be perceived as three-dimensional'),
('tcm', 'tactile text', 'Content expressed through a form of notation for language intended to be perceived through touch'),
('tci', 'tactile image', 'Content expressed through images intended to be perceived through touch'),
('tcn', 'tactile notated music', 'Content expressed through a form of musical notation intended to be perceived through touch'),
('tcf', 'tactile three-dimensional form', 'Content expressed through a form intended to be perceived as three-dimensional'),
('cod', 'computer dataset', 'Content expressed through digitally encoded data'),
('cop', 'computer program', 'Content expressed through digitally encoded instructions'),
('xxx', 'other', 'Content expressed through a form not covered by other categories'),
('zzz', 'not applicable', 'No content type is applicable');

-- Media Types (RDA 3.2)
CREATE TABLE rda_media_types (
  media_type_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  definition TEXT
);

INSERT INTO rda_media_types (code, label, definition) VALUES
('n', 'unmediated', 'Media used to store content designed to be perceived directly through human senses'),
('s', 'audio', 'Media used to store content for playback through hearing'),
('v', 'video', 'Media used to store moving images'),
('c', 'computer', 'Media used to store electronic content designed for computer processing'),
('g', 'projected', 'Media used to store content designed to be projected'),
('h', 'microform', 'Media used to store content at a size requiring magnification'),
('x', 'other', 'Media not covered by other categories'),
('z', 'not applicable', 'No media type is applicable');

-- Carrier Types (RDA 3.3)
CREATE TABLE rda_carrier_types (
  carrier_type_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  definition TEXT,
  media_type_code VARCHAR(50) REFERENCES rda_media_types(code)
);

INSERT INTO rda_carrier_types (code, label, media_type_code) VALUES
('nc', 'volume', 'n'),
('no', 'sheet', 'n'),
('nr', 'card', 'n'),
('sd', 'audio disc', 's'),
('ss', 'audiocassette', 's'),
('vd', 'videodisc', 'v'),
('vf', 'videocassette', 'v'),
('cr', 'online resource', 'c'),
('cd', 'computer disc', 'c'),
('ce', 'computer disc cartridge', 'c'),
('gs', 'slide', 'g'),
('gt', 'overhead transparency', 'g'),
('he', 'microfiche', 'h'),
('hd', 'microfilm reel', 'h');
```

---

## 5. Core RDA Elements Mapping

### Mapping from Current Schema to RDA Schema

| Current Field | Current Table | RDA Entity | RDA Element | RDA Reference | Core Level |
|--------------|---------------|------------|-------------|---------------|------------|
| `title` | books | Work | preferred_title | RDA 6.2 | Core |
| `author` | books | Agent + Relationship | preferred_name + "author" | RDA 19.2 | Core |
| `genre` | books | Work | form_of_work | RDA 6.3 | Core if |
| `sub_genre` | books | Work | subjects | - | Local |
| `publisher` | books | Manifestation + Agent | publisher_name | RDA 2.8 | Core |
| `publication_year` | books | Manifestation | date_of_publication | RDA 2.8 | Core |
| `description` | books | Expression | summarization_of_content | RDA 7.10 | Core if |
| `isbn` | books | Manifestation | isbn | RDA 2.15 | Core |
| `cover_image_url` | books | Manifestation | cover_image_url | - | Local |
| `age_rating` | books | Item | age_rating | - | Local |
| `collection_id` | books | Item | collection_id | - | Local |
| `total_copies` | books | Items | COUNT(*) | - | Derived |
| `available_copies` | books | Items | COUNT(WHERE status='available') | - | Derived |
| `status` | books | Item | circulation_status | - | Local |

### New RDA Elements Not in Current Schema

| RDA Entity | RDA Element | Description | Core Level |
|------------|-------------|-------------|------------|
| Expression | language_of_expression | Language code (ISO 639) | Core |
| Expression | content_type | Text, audio, video, etc. | Core |
| Manifestation | media_type | Unmediated, audio, computer, etc. | LC Core |
| Manifestation | carrier_type | Volume, disc, online resource, etc. | Core |
| Manifestation | extent | Page count, duration, file size | Core |
| Manifestation | statement_of_responsibility | Author/contributor statement | Core |
| Work | form_of_work | Novel, poem, biography, etc. | Core if |
| Work | date_of_work | Original composition date | Core if |
| Agent | date_of_birth | For person agents | Core |
| Agent | date_of_death | For person agents | Core |

---

## 6. Database Migration Strategy

### Phase 1: Schema Creation (Non-Breaking)

**Goal**: Create new RDA tables alongside existing `books` table.

```sql
-- File: database/migrations/001_create_rda_schema.sql

-- Create all new tables (works, expressions, manifestations, items, agents, relationships)
-- Add foreign key from books to manifestations for transition period
ALTER TABLE books ADD COLUMN manifestation_id INTEGER REFERENCES manifestations(manifestation_id);
ALTER TABLE books ADD COLUMN migrated_to_rda BOOLEAN DEFAULT FALSE;
```

### Phase 2: Data Migration

**Goal**: Transform existing data into WEMI model.

#### Migration Logic

```python
# File: backend/app/utils/rda_migration.py

def migrate_book_to_rda(book_record):
    """
    Migrates a single book record to RDA structure.

    Creates:
    - 1 Work (unless existing)
    - 1 Expression (usually)
    - 1 Manifestation
    - N Items (based on total_copies)
    """

    # Step 1: Create or find Work
    work = find_or_create_work(
        preferred_title=book_record['title'],
        form_of_work='novel',  # Infer from genre
        nature_of_content=['fiction'] if is_fiction(book_record['genre']) else ['non-fiction']
    )

    # Step 2: Create or find Author Agent
    if book_record['author']:
        agent = find_or_create_agent(
            preferred_name=book_record['author'],
            agent_type='person'
        )
        create_work_agent_relationship(
            work_id=work.id,
            agent_id=agent.id,
            relationship_role='author'
        )

    # Step 3: Create Expression
    expression = create_expression(
        work_id=work.id,
        language_of_expression='eng',  # Default to English, manual review needed
        content_type='txt',  # Text
        summarization_of_content=book_record['description']
    )

    # Step 4: Create Manifestation
    manifestation = create_manifestation(
        expression_id=expression.id,
        title_proper=book_record['title'],
        publisher_name=book_record['publisher'],
        date_of_publication=book_record['publication_year'],
        isbn=book_record['isbn'],
        media_type='n',  # unmediated
        carrier_type='nc',  # volume
        cover_image_url=book_record['cover_image_url']
    )

    # Step 5: Create Publisher Agent (if applicable)
    if book_record['publisher']:
        publisher_agent = find_or_create_agent(
            preferred_name=book_record['publisher'],
            agent_type='corporate_body'
        )
        create_manifestation_agent_relationship(
            manifestation_id=manifestation.id,
            agent_id=publisher_agent.id,
            relationship_role='publisher'
        )

    # Step 6: Create Items
    for i in range(book_record['total_copies']):
        is_available = i < book_record['available_copies']

        item = create_item(
            manifestation_id=manifestation.id,
            barcode=generate_barcode(),
            circulation_status='available' if is_available else 'checked_out',
            collection_id=book_record['collection_id'],
            age_rating=book_record['age_rating']
        )

    # Step 7: Update original books record
    update_book_migration_status(
        book_id=book_record['book_id'],
        manifestation_id=manifestation.id,
        migrated_to_rda=True
    )

    return {
        'work_id': work.id,
        'expression_id': expression.id,
        'manifestation_id': manifestation.id,
        'items_created': book_record['total_copies']
    }
```

#### Migration Script

```bash
# File: scripts/migrate_to_rda.sh

#!/bin/bash

echo "Starting RDA migration..."

# Backup database
pg_dump nukweb > backups/pre_rda_migration_$(date +%Y%m%d_%H%M%S).sql

# Run migration
python -m backend.app.utils.rda_migration

echo "Migration complete. Please review data in admin interface."
```

### Phase 3: Dual Operation Period

**Goal**: Both old and new APIs work simultaneously.

- Old API (`/api/admin/books`) continues to work by aggregating RDA data
- New API (`/api/rda/works`, `/api/rda/manifestations`, etc.) provides full RDA access
- Admin interface shows both views

### Phase 4: API Cutover

**Goal**: Deprecate old API, promote new API.

- Mark old endpoints as deprecated
- Update frontend to use new endpoints
- Provide migration guide for any external integrations

### Phase 5: Legacy Cleanup

**Goal**: Remove old `books` table after validation.

```sql
-- After 6+ months of successful operation
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS borrowings CASCADE;  -- Replaced by item_transactions
```

---

## 7. API Changes Required

### 7.1 New RDA API Endpoints

#### Work Endpoints

```
GET    /api/rda/works                    # List all works (with pagination)
GET    /api/rda/works/:id                # Get single work with expressions
POST   /api/rda/works                    # Create new work
PUT    /api/rda/works/:id                # Update work
DELETE /api/rda/works/:id                # Delete work
GET    /api/rda/works/:id/expressions    # Get all expressions of a work
GET    /api/rda/works/:id/agents         # Get all agents related to work
```

#### Expression Endpoints

```
GET    /api/rda/expressions              # List all expressions
GET    /api/rda/expressions/:id          # Get single expression with manifestations
POST   /api/rda/expressions              # Create new expression
PUT    /api/rda/expressions/:id          # Update expression
DELETE /api/rda/expressions/:id          # Delete expression
```

#### Manifestation Endpoints

```
GET    /api/rda/manifestations           # List all manifestations
GET    /api/rda/manifestations/:id       # Get single manifestation with items
POST   /api/rda/manifestations           # Create new manifestation
PUT    /api/rda/manifestations/:id       # Update manifestation
DELETE /api/rda/manifestations/:id       # Delete manifestation
GET    /api/rda/manifestations/:id/items # Get all items of manifestation
POST   /api/rda/manifestations/:id/items # Add new item (copy)
```

#### Item Endpoints

```
GET    /api/rda/items                    # List all items
GET    /api/rda/items/:id                # Get single item
PUT    /api/rda/items/:id                # Update item
PATCH  /api/rda/items/:id/status         # Update circulation status
DELETE /api/rda/items/:id                # Withdraw item
GET    /api/rda/items/barcode/:barcode   # Look up item by barcode
```

#### Agent Endpoints

```
GET    /api/rda/agents                   # List all agents
GET    /api/rda/agents/:id               # Get single agent
POST   /api/rda/agents                   # Create new agent
PUT    /api/rda/agents/:id               # Update agent
DELETE /api/rda/agents/:id               # Delete agent
GET    /api/rda/agents/:id/works         # Get all works by agent
```

#### Cataloging Workflow Endpoint

```
POST   /api/rda/catalog                  # Complete cataloging in one request
```

**Request Body**:
```json
{
  "work": {
    "preferred_title": "Pride and Prejudice",
    "form_of_work": "novel",
    "date_of_work": "1813"
  },
  "agents": [
    {
      "preferred_name": "Austen, Jane",
      "date_of_birth": "1775",
      "date_of_death": "1817",
      "relationship_role": "author"
    }
  ],
  "expression": {
    "language_of_expression": "eng",
    "content_type": "txt"
  },
  "manifestation": {
    "title_proper": "Pride and Prejudice",
    "publisher_name": "Penguin Classics",
    "date_of_publication": "2003",
    "isbn": "9780141439518",
    "media_type": "n",
    "carrier_type": "nc",
    "extent": "328 pages"
  },
  "items": [
    {
      "barcode": "000123456",
      "collection_id": 1,
      "circulation_status": "available"
    }
  ]
}
```

### 7.2 Backward Compatible Endpoints

Keep existing endpoints working by aggregating RDA data:

```python
# File: backend/app/routes/admin_books_legacy.py

@admin_books_bp.route('/books', methods=['GET'])
def get_books():
    """
    Legacy endpoint - aggregates RDA data into old format.
    """
    # Query manifestations with joined works, expressions, items
    query = """
        SELECT
            m.manifestation_id,
            m.isbn,
            m.title_proper as title,
            string_agg(DISTINCT a.preferred_name, ', ') as author,
            w.form_of_work as genre,
            m.publisher_name as publisher,
            m.date_of_publication as publication_year,
            e.summarization_of_content as description,
            m.cover_image_url,
            COUNT(i.item_id) as total_copies,
            COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'available') as available_copies
        FROM manifestations m
        JOIN expressions e ON m.expression_id = e.expression_id
        JOIN works w ON e.work_id = w.work_id
        LEFT JOIN work_agent_relationships war ON w.work_id = war.work_id AND war.relationship_role = 'author'
        LEFT JOIN agents a ON war.agent_id = a.agent_id
        LEFT JOIN items i ON m.manifestation_id = i.manifestation_id
        WHERE m.is_deleted = FALSE
        GROUP BY m.manifestation_id, w.work_id, e.expression_id
        ORDER BY m.created_at DESC
    """

    # Return in old format for backward compatibility
    return jsonify(books)
```

### 7.3 Enhanced Search Endpoints

```
GET /api/search/unified                  # Search across all entities
  ?q=<query>                             # Full-text search
  &type=<work|manifestation|agent>       # Filter by entity type
  &language=<code>                       # Filter by language
  &content_type=<code>                   # Filter by content type
  &media_type=<code>                     # Filter by media type
  &date_from=<year>                      # Filter by date range
  &date_to=<year>
  &available_only=<boolean>              # Only show available items
```

---

## 8. Frontend Changes Required

### 8.1 New Cataloging Workflow Component

**File**: `frontend/src/components/RDACataloguing.js`

#### Workflow Steps

```javascript
const catalogingSteps = [
  {
    step: 1,
    title: 'Identify Work',
    description: 'Search for existing work or create new',
    fields: ['preferred_title', 'form_of_work', 'date_of_work']
  },
  {
    step: 2,
    title: 'Add Creators',
    description: 'Link authors, illustrators, and other creators',
    fields: ['agent_search', 'relationship_role']
  },
  {
    step: 3,
    title: 'Describe Expression',
    description: 'Specify language, content type, and version details',
    fields: ['language_of_expression', 'content_type', 'summarization_of_content']
  },
  {
    step: 4,
    title: 'Catalog Manifestation',
    description: 'Enter publication details',
    fields: ['title_proper', 'publisher_name', 'date_of_publication', 'isbn',
             'media_type', 'carrier_type', 'extent']
  },
  {
    step: 5,
    title: 'Add Items',
    description: 'Create physical/digital copies',
    fields: ['barcode', 'call_number', 'collection_id', 'circulation_status']
  }
];
```

#### Smart ISBN Lookup Enhancement

```javascript
async function fetchByISBN(isbn) {
  // Fetch from external APIs (OpenLibrary, Google Books)
  const externalData = await api.fetchExternalBookData(isbn);

  // Check if work already exists in our database
  const existingWork = await api.searchWorks(externalData.title, externalData.author);

  if (existingWork) {
    return {
      useExisting: true,
      work: existingWork,
      message: 'Found existing work in catalog. Add new manifestation?',
      externalData: externalData
    };
  } else {
    return {
      useExisting: false,
      suggestedData: {
        work: {
          preferred_title: externalData.title,
          form_of_work: inferFormOfWork(externalData.genre),
          date_of_work: externalData.originalPublicationYear
        },
        agents: externalData.authors.map(author => ({
          preferred_name: author,
          agent_type: 'person',
          relationship_role: 'author'
        })),
        expression: {
          language_of_expression: externalData.language || 'eng',
          content_type: 'txt',
          summarization_of_content: externalData.description
        },
        manifestation: {
          title_proper: externalData.title,
          publisher_name: externalData.publisher,
          date_of_publication: externalData.publicationYear,
          isbn: isbn,
          media_type: 'n',
          carrier_type: 'nc',
          extent: `${externalData.pageCount} pages`,
          cover_image_url: externalData.coverImage
        }
      }
    };
  }
}
```

### 8.2 Browse/Display Components

#### Work Detail View

```javascript
// frontend/src/components/WorkDetail.js

<WorkDetail>
  <WorkInfo>
    <Title>{work.preferred_title}</Title>
    <Creators>{agents.filter(r => r.role === 'author')}</Creators>
    <FormOfWork>{work.form_of_work}</FormOfWork>
    <DateOfWork>{work.date_of_work}</DateOfWork>
  </WorkInfo>

  <ExpressionsList>
    {expressions.map(expr => (
      <ExpressionCard key={expr.id}>
        <Language>{expr.language_of_expression}</Language>
        <ContentType>{expr.content_type}</ContentType>
        <ManifestationCount>{expr.manifestations.length} editions</ManifestationCount>
      </ExpressionCard>
    ))}
  </ExpressionsList>

  <RelatedWorks>
    {workRelationships.map(rel => (
      <RelatedWorkCard type={rel.relationship_type}>
        {rel.target_work.preferred_title}
      </RelatedWorkCard>
    ))}
  </RelatedWorks>
</WorkDetail>
```

#### Manifestation Detail View

```javascript
// frontend/src/components/ManifestationDetail.js

<ManifestationDetail>
  <ManifestationInfo>
    <Title>{manifestation.title_proper}</Title>
    <Publisher>{manifestation.publisher_name}</Publisher>
    <PublicationDate>{manifestation.date_of_publication}</PublicationDate>
    <ISBN>{manifestation.isbn}</ISBN>
    <Format>{mediaType} - {carrierType}</Format>
    <Extent>{manifestation.extent}</Extent>
  </ManifestationInfo>

  <CoverImage src={manifestation.cover_image_url} />

  <ItemsList>
    <CopiesAvailable>
      {items.filter(i => i.circulation_status === 'available').length} of {items.length} available
    </CopiesAvailable>

    {items.map(item => (
      <ItemCard key={item.id}>
        <Barcode>{item.barcode}</Barcode>
        <CallNumber>{item.call_number}</CallNumber>
        <Status status={item.circulation_status}>{item.circulation_status}</Status>
        <Collection>{item.collection.collection_name}</Collection>
      </ItemCard>
    ))}
  </ItemsList>
</ManifestationDetail>
```

### 8.3 Patron Browse Interface

**Enhancement**: Group manifestations by work

```javascript
// frontend/src/components/BrowseBooks.js

<BrowseByWorks>
  {works.map(work => (
    <WorkCard key={work.id}>
      <WorkTitle>{work.preferred_title}</WorkTitle>
      <Authors>{work.agents.map(a => a.preferred_name).join(', ')}</Authors>

      <EditionsAvailable>
        {work.expressions.flatMap(e => e.manifestations).length} editions available
      </EditionsAvailable>

      <EditionsList>
        {work.expressions.map(expr =>
          expr.manifestations.map(manif => (
            <EditionCard key={manif.id}>
              <EditionInfo>
                {expr.language_of_expression} - {manif.date_of_publication}
              </EditionInfo>
              <Publisher>{manif.publisher_name}</Publisher>
              <Availability>
                {manif.items_available} of {manif.items_total} available
              </Availability>
              <CheckoutButton manifestation_id={manif.id} />
            </EditionCard>
          ))
        )}
      </EditionsList>
    </WorkCard>
  ))}
</BrowseByWorks>
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Deliverables**:
- [ ] Create new database schema (all RDA tables)
- [ ] Set up migration scripts framework
- [ ] Create RDA vocabulary seed data
- [ ] Add unit tests for new models

**Files Created**:
- `database/migrations/001_create_rda_schema.sql`
- `database/migrations/002_seed_rda_vocabularies.sql`
- `backend/app/models/rda_models.py`
- `backend/app/tests/test_rda_models.py`

### Phase 2: Data Migration (Weeks 3-4)

**Deliverables**:
- [ ] Implement migration logic
- [ ] Run test migrations on sample data
- [ ] Create data quality reports
- [ ] Manual review and correction tools
- [ ] Migrate production data

**Files Created**:
- `backend/app/utils/rda_migration.py`
- `backend/app/utils/rda_data_quality.py`
- `scripts/migrate_to_rda.sh`
- `scripts/validate_migration.py`

### Phase 3: New API Development (Weeks 5-7)

**Deliverables**:
- [ ] Implement all RDA endpoints (works, expressions, manifestations, items, agents)
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Add authentication and authorization
- [ ] Write integration tests
- [ ] Update legacy endpoints for backward compatibility

**Files Created**:
- `backend/app/routes/rda_works.py`
- `backend/app/routes/rda_expressions.py`
- `backend/app/routes/rda_manifestations.py`
- `backend/app/routes/rda_items.py`
- `backend/app/routes/rda_agents.py`
- `backend/app/tests/test_rda_api.py`
- `docs/api/rda_api_spec.yaml`

### Phase 4: Admin Interface (Weeks 8-10)

**Deliverables**:
- [ ] Build RDA cataloging workflow component
- [ ] Create work/expression/manifestation detail views
- [ ] Enhance ISBN lookup with work deduplication
- [ ] Add agent management interface
- [ ] Build relationship management UI
- [ ] Create migration review dashboard

**Files Created**:
- `frontend/src/components/RDACataloguing.js`
- `frontend/src/components/WorkDetail.js`
- `frontend/src/components/ManifestationDetail.js`
- `frontend/src/components/AgentManagement.js`
- `frontend/src/components/MigrationReview.js`
- `frontend/src/services/rdaAPI.js`

### Phase 5: Patron Interface (Weeks 11-12)

**Deliverables**:
- [ ] Update browse books to show works
- [ ] Group manifestations by work
- [ ] Show multiple editions/formats
- [ ] Update search to include all RDA entities
- [ ] Maintain user experience consistency

**Files Modified**:
- `frontend/src/components/BrowseBooks.js`
- `frontend/src/components/BookDetail.js`
- `frontend/src/components/Search.js`

### Phase 6: Testing & Documentation (Weeks 13-14)

**Deliverables**:
- [ ] End-to-end testing
- [ ] User acceptance testing with librarians
- [ ] Create training materials
- [ ] Write migration runbook
- [ ] Update user documentation

**Files Created**:
- `docs/RDA_TRAINING_GUIDE.md`
- `docs/MIGRATION_RUNBOOK.md`
- `docs/CATALOGING_WORKFLOW.md`

### Phase 7: Deployment (Week 15)

**Deliverables**:
- [ ] Backup production database
- [ ] Run migration in production
- [ ] Monitor performance
- [ ] Address any issues
- [ ] Deprecate old endpoints (after validation period)

---

## 10. Backward Compatibility

### Approach: Dual Operation

During the transition period (suggested: 6-12 months), both the old and new systems will operate simultaneously.

### Legacy API Support

```python
# File: backend/app/routes/admin_books_legacy.py

@admin_books_bp.route('/books', methods=['GET'])
def get_books_legacy():
    """
    DEPRECATED: This endpoint is maintained for backward compatibility.
    Please migrate to /api/rda/manifestations
    """
    response.headers['X-API-Deprecated'] = 'true'
    response.headers['X-API-Sunset'] = '2026-06-01'  # 6 months from now
    response.headers['X-API-Replacement'] = '/api/rda/manifestations'

    # Aggregate RDA data into legacy format
    # ...
```

### Data Consistency

```python
# Ensure both views show the same data
# Any updates via legacy API are applied to RDA tables
# Any updates via RDA API are reflected in aggregated views
```

### Deprecation Timeline

| Date | Action |
|------|--------|
| **Week 1** | New RDA schema deployed, migration begins |
| **Week 15** | Migration complete, new API available |
| **Month 4** | Legacy API marked as deprecated (headers added) |
| **Month 6** | All admin users trained on new interface |
| **Month 9** | Legacy API sunset warning intensifies |
| **Month 12** | Legacy API removed (planned) |

---

## Appendices

### A. RDA Resources

- **RDA Toolkit**: https://www.rdatoolkit.org/
- **Library of Congress RDA Resources**: https://www.loc.gov/aba/rda/
- **RDA Registry**: https://www.rdaregistry.info/
- **LC RDA Core Elements**: https://www.loc.gov/aba/rda/pdf/core_elements.pdf
- **IFLA LRM**: https://www.ifla.org/publications/node/11412

### B. SQL Schema Files

All SQL schema files will be created in:
- `database/migrations/001_create_rda_schema.sql` (Main schema)
- `database/migrations/002_seed_rda_vocabularies.sql` (Controlled vocabularies)
- `database/migrations/003_create_indexes.sql` (Performance indexes)

### C. Sample Data

Sample RDA records for testing:
- `database/sample_data/rda_sample_books.json`
- `database/sample_data/rda_sample_agents.json`

### D. Testing Strategy

- **Unit Tests**: Test individual models and functions
- **Integration Tests**: Test API endpoints
- **Migration Tests**: Test data migration accuracy
- **Performance Tests**: Ensure query performance is acceptable
- **User Acceptance Tests**: Validate with librarians

---

## Conclusion

This RDA upgrade represents a significant modernization of the library catalog system. While it requires substantial development effort, the benefits include:

1. **Standards Compliance**: Aligns with international cataloging standards
2. **Better Data Organization**: Clear separation of works, expressions, manifestations, and items
3. **Enhanced Discovery**: Users can find all editions/formats of a work
4. **Professional Cataloging**: Supports complex relationships and detailed metadata
5. **Future-Proof**: Prepares for linked data and semantic web technologies
6. **Interoperability**: Enables metadata exchange with other libraries

The phased implementation approach ensures a smooth transition while maintaining service continuity.

---

**Next Steps**: Review this design document and approve to proceed with implementation planning.
