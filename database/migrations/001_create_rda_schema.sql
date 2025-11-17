-- ============================================================================
-- RDA CATALOGUE SCHEMA MIGRATION
-- Resource Description and Access (RDA) Compliant Database Schema
--
-- Based on IFLA Library Reference Model (LRM) and RDA specifications
-- Implements WEMI (Work-Expression-Manifestation-Item) model
--
-- Version: 1.0
-- Date: 2025-11-17
-- ============================================================================

-- ============================================================================
-- SECTION 1: WORKS
-- The intellectual or artistic content (RDA Chapter 6)
-- ============================================================================

CREATE TABLE works (
  work_id SERIAL PRIMARY KEY,

  -- Title of Work (RDA 6.2 - Core)
  preferred_title VARCHAR(500) NOT NULL,
  variant_titles TEXT[],  -- Alternative titles

  -- Form of Work (RDA 6.3 - Core if)
  form_of_work VARCHAR(100),  -- novel, poem, essay, biography, etc.

  -- Date of Work (RDA 6.4 - Core if)
  date_of_work VARCHAR(100),  -- Original creation date (can be approximate: "1813", "ca. 1600")

  -- Place of Origin of Work (RDA 6.5)
  place_of_origin VARCHAR(255),

  -- Other Distinguishing Characteristic of Work (RDA 6.6)
  distinguishing_characteristic TEXT,

  -- History of Work (RDA 7.18)
  history_of_work TEXT,

  -- Nature of Content (RDA 7.2 - LC Core)
  nature_of_content VARCHAR(100)[],  -- Array: fiction, non-fiction, biography, etc.

  -- Intended Audience (RDA 7.7 - Core if)
  intended_audience VARCHAR(100),  -- general, juvenile, adolescent, adult, specialized

  -- Subject Access
  subjects TEXT[],  -- Subject headings for discovery

  -- System metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cataloging_source VARCHAR(50),
  last_modified_by VARCHAR(50),

  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_works_preferred_title ON works(preferred_title);
CREATE INDEX idx_works_form ON works(form_of_work);
CREATE INDEX idx_works_date ON works(date_of_work);
CREATE INDEX idx_works_subjects ON works USING gin(subjects);

-- ============================================================================
-- SECTION 2: EXPRESSIONS
-- Realization of a work in a specific language/version (RDA Chapter 6)
-- ============================================================================

CREATE TABLE expressions (
  expression_id SERIAL PRIMARY KEY,
  work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,

  -- Content Type (RDA 6.9 - Core)
  -- Values from RDA controlled vocabulary: txt, spw, prm, sti, tdi, etc.
  content_type VARCHAR(50) NOT NULL,

  -- Language of Expression (RDA 6.11 - Core)
  language_of_expression VARCHAR(10) NOT NULL,  -- ISO 639-2/B: eng, spa, fre, ger, etc.
  additional_languages VARCHAR(10)[],  -- For multilingual content

  -- Date of Expression (RDA 6.10)
  date_of_expression VARCHAR(100),  -- Date of this specific version

  -- Other Distinguishing Characteristic of Expression
  expression_characteristic TEXT,

  -- Content Characteristics (RDA Chapter 7)

  -- Summarization of Content (RDA 7.10 - Core if)
  summarization_of_content TEXT,  -- Description, abstract, or summary

  -- Supplementary Content (RDA 7.16 - Core if)
  supplementary_content VARCHAR(255)[],  -- index, bibliography, appendix, glossary, etc.

  -- Illustrative Content (RDA 7.15 - Core if)
  illustrative_content VARCHAR(100)[],  -- illustrations, maps, charts, photographs, etc.

  -- Colour Content (RDA 7.17)
  colour_content VARCHAR(50),  -- black and white, color, etc.

  -- Duration (RDA 7.22 - Core for audio/video)
  duration VARCHAR(50),  -- "2 hr., 30 min." for audiobooks, films, etc.

  -- Scale (RDA 7.25 - Core for cartographic)
  scale VARCHAR(100),  -- For maps

  -- Accessibility Content (RDA 7.14)
  accessibility_content VARCHAR(100)[],  -- closed captions, audio description, large print, etc.

  -- System metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Business rules
  CONSTRAINT unique_work_language_content UNIQUE(work_id, language_of_expression, content_type)
);

CREATE INDEX idx_expressions_work_id ON expressions(work_id);
CREATE INDEX idx_expressions_language ON expressions(language_of_expression);
CREATE INDEX idx_expressions_content_type ON expressions(content_type);

-- ============================================================================
-- SECTION 3: MANIFESTATIONS
-- Physical or digital publication (RDA Chapters 2-3)
-- ============================================================================

CREATE TABLE manifestations (
  manifestation_id SERIAL PRIMARY KEY,
  expression_id INTEGER NOT NULL REFERENCES expressions(expression_id) ON DELETE CASCADE,

  -- Title (RDA 2.3 - Core)
  title_proper VARCHAR(500) NOT NULL,
  parallel_title_proper VARCHAR(500)[],  -- Titles in other languages on same resource
  other_title_information TEXT,  -- Subtitle, alternative title

  -- Statement of Responsibility (RDA 2.4 - Core)
  statement_of_responsibility TEXT,  -- "by Jane Austen ; edited by John Smith"

  -- Edition Statement (RDA 2.5 - Core if)
  edition_statement VARCHAR(255),  -- "2nd edition", "Revised edition", "Director's cut"

  -- Numbering of Serials (RDA 2.6)
  numbering_of_serials VARCHAR(255),  -- For journals, magazines

  -- Production Statement (RDA 2.7)
  production_statement TEXT,

  -- Publication Statement (RDA 2.8 - Core)
  place_of_publication VARCHAR(255),
  publisher_name VARCHAR(255),
  date_of_publication VARCHAR(100),

  -- Distribution Statement (RDA 2.9)
  place_of_distribution VARCHAR(255),
  distributor_name VARCHAR(255),
  date_of_distribution VARCHAR(100),

  -- Manufacture Statement (RDA 2.10)
  place_of_manufacture VARCHAR(255),
  manufacturer_name VARCHAR(255),
  date_of_manufacture VARCHAR(100),

  -- Copyright Date (RDA 2.11 - Core if)
  copyright_date VARCHAR(100),

  -- Series Statement (RDA 2.12)
  series_statement VARCHAR(500),
  series_numbering VARCHAR(100),

  -- Mode of Issuance (RDA 2.13)
  mode_of_issuance VARCHAR(50),  -- single unit, multipart monograph, serial, integrating resource

  -- Frequency (RDA 2.14)
  frequency VARCHAR(100),  -- For serials: daily, weekly, monthly, etc.

  -- Identifier for the Manifestation (RDA 2.15 - Core)
  isbn VARCHAR(13),
  isbn_10 VARCHAR(10),
  issn VARCHAR(9),  -- For serials
  ismn VARCHAR(13),  -- For music
  other_identifier VARCHAR(255),
  identifier_type VARCHAR(50),  -- Type of other_identifier: LCCN, DOI, OCLC, etc.

  -- Carrier Characteristics (RDA Chapter 3)

  -- Media Type (RDA 3.2 - LC Core)
  -- Values: n (unmediated), s (audio), v (video), c (computer), g (projected), h (microform)
  media_type VARCHAR(50) NOT NULL,

  -- Carrier Type (RDA 3.3 - Core)
  -- Values: nc (volume), sd (audio disc), vd (videodisc), cr (online resource), etc.
  carrier_type VARCHAR(50) NOT NULL,

  -- Extent (RDA 3.4 - Core)
  extent VARCHAR(255),  -- "328 pages", "1 audio disc (2 hr., 30 min.)", "1 online resource"

  -- Dimensions (RDA 3.5 - Core if)
  dimensions VARCHAR(100),  -- "23 cm", "12 cm diameter", etc.

  -- Base Material (RDA 3.6)
  base_material VARCHAR(100),  -- paper, vinyl, polycarbonate, etc.

  -- Applied Material (RDA 3.7)
  applied_material VARCHAR(100),  -- ink, graphite, etc.

  -- Mount (RDA 3.8)
  mount VARCHAR(100),

  -- Production Method (RDA 3.9)
  production_method VARCHAR(100),  -- printing, engraving, etc.

  -- Generation (RDA 3.10)
  generation VARCHAR(100),  -- original, master, reproduction, etc.

  -- Layout (RDA 3.11)
  layout VARCHAR(100),  -- double sided, single sided, etc.

  -- Book Format (RDA 3.12)
  book_format VARCHAR(50),  -- folio, quarto, octavo, etc.

  -- Font Size (RDA 3.13)
  font_size VARCHAR(50),  -- giant print, large print, etc.

  -- Polarity (RDA 3.14)
  polarity VARCHAR(50),  -- For microforms

  -- Notes (RDA 2.17)
  notes TEXT[],

  -- Digital Characteristics
  digital_file_characteristic TEXT,
  digital_representation VARCHAR(100),
  url TEXT,  -- For online resources

  -- Cover Images (not in RDA, but useful for library systems)
  cover_image_url TEXT,
  thumbnail_url TEXT,

  -- System metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_manifestations_expression_id ON manifestations(expression_id);
CREATE INDEX idx_manifestations_isbn ON manifestations(isbn);
CREATE INDEX idx_manifestations_issn ON manifestations(issn);
CREATE INDEX idx_manifestations_publisher ON manifestations(publisher_name);
CREATE INDEX idx_manifestations_title ON manifestations(title_proper);
CREATE INDEX idx_manifestations_date ON manifestations(date_of_publication);
CREATE INDEX idx_manifestations_media_type ON manifestations(media_type);
CREATE INDEX idx_manifestations_carrier_type ON manifestations(carrier_type);

-- ============================================================================
-- SECTION 4: ITEMS
-- Individual physical or digital copies (RDA Chapter 2)
-- ============================================================================

CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  manifestation_id INTEGER NOT NULL REFERENCES manifestations(manifestation_id) ON DELETE CASCADE,

  -- Item Identifier (RDA 2.18 - Core)
  barcode VARCHAR(50) UNIQUE,
  rfid_tag VARCHAR(50),
  call_number VARCHAR(100),

  -- Custodial History of Item (RDA 2.19)
  custodial_history TEXT,
  immediate_source_of_acquisition TEXT,

  -- Condition of Item (RDA 2.20)
  condition_of_item VARCHAR(50),  -- excellent, good, fair, poor, damaged
  condition_notes TEXT,
  last_condition_check_date DATE,

  -- Location
  collection_id INTEGER REFERENCES collections(collection_id),
  shelf_location VARCHAR(100),
  current_location VARCHAR(100),  -- For items in transit, repair, etc.

  -- Circulation Status
  circulation_status VARCHAR(50) NOT NULL DEFAULT 'available',
  -- Possible values:
  --   available, checked_out, on_hold, in_transit, on_order,
  --   in_processing, missing, lost, damaged, withdrawn,
  --   non_circulating, reference_only, restricted

  circulation_status_date TIMESTAMP,  -- When status last changed

  -- Circulation Policy
  circulation_policy VARCHAR(50),  -- normal, reference_only, restricted, overnight, etc.
  loan_period_days INTEGER DEFAULT 14,
  renewable BOOLEAN DEFAULT TRUE,
  max_renewals INTEGER DEFAULT 2,
  max_holds INTEGER DEFAULT 1,

  -- Restriction on Access or Use (RDA 4.4, 4.5)
  restriction_on_access TEXT,
  restriction_on_use TEXT,

  -- Acquisition Information
  acquisition_method VARCHAR(50),  -- purchase, gift, deposit, exchange, etc.
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  acquisition_source VARCHAR(255),  -- Vendor, donor, etc.
  invoice_number VARCHAR(100),

  -- Age Rating (Local extension for public libraries)
  age_rating VARCHAR(50),

  -- Statistical Categories
  item_category VARCHAR(50),  -- For reporting: adult_fiction, children_nonfiction, etc.

  -- System metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Withdrawn/Deleted items (soft delete)
  is_withdrawn BOOLEAN DEFAULT FALSE,
  withdrawn_at TIMESTAMP,
  withdrawn_reason TEXT,
  withdrawn_by VARCHAR(50)
);

CREATE INDEX idx_items_manifestation_id ON items(manifestation_id);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_call_number ON items(call_number);
CREATE INDEX idx_items_collection_id ON items(collection_id);
CREATE INDEX idx_items_circulation_status ON items(circulation_status);
CREATE INDEX idx_items_shelf_location ON items(shelf_location);

-- ============================================================================
-- SECTION 5: AGENTS (Persons, Families, Corporate Bodies)
-- RDA Chapters 9-11
-- ============================================================================

CREATE TABLE agents (
  agent_id SERIAL PRIMARY KEY,

  -- Agent Type
  agent_type VARCHAR(20) NOT NULL CHECK (agent_type IN ('person', 'family', 'corporate_body')),

  -- Preferred Name (Core - RDA 9.2.2, 10.2.2, 11.2.2)
  preferred_name VARCHAR(500) NOT NULL,
  variant_names TEXT[],  -- Alternative names, pseudonyms

  -- Attributes for Persons (RDA Chapter 9)

  -- Dates Associated with Person (RDA 9.3 - Core)
  date_of_birth VARCHAR(50),
  date_of_death VARCHAR(50),

  -- Title of Person (RDA 9.4)
  title_of_person VARCHAR(100),  -- Dr., Sir, Professor, etc.

  -- Fuller Form of Name (RDA 9.5)
  fuller_form_of_name VARCHAR(255),

  -- Other Designation Associated with Person (RDA 9.6)
  other_designation VARCHAR(255),

  -- Gender (RDA 9.7)
  gender VARCHAR(50),

  -- Place of Birth (RDA 9.8)
  place_of_birth VARCHAR(255),

  -- Place of Death (RDA 9.9)
  place_of_death VARCHAR(255),

  -- Country Associated with Person (RDA 9.10)
  country_associated VARCHAR(100),

  -- Place of Residence (RDA 9.11)
  place_of_residence VARCHAR(255),

  -- Address (RDA 9.12)
  address TEXT,

  -- Affiliation (RDA 9.13)
  affiliation VARCHAR(255),

  -- Language of Person (RDA 9.14)
  language_of_person VARCHAR(10)[],  -- ISO 639 codes

  -- Field of Activity (RDA 9.15)
  field_of_activity VARCHAR(255)[],

  -- Profession or Occupation (RDA 9.16)
  profession_or_occupation VARCHAR(255)[],

  -- Biographical Information (RDA 9.17)
  biographical_information TEXT,

  -- Attributes for Families (RDA Chapter 10)

  -- Type of Family (RDA 10.3)
  type_of_family VARCHAR(100),  -- clan, dynasty, house, family

  -- Date Associated with Family (RDA 10.4)
  date_of_family VARCHAR(100),

  -- Place Associated with Family (RDA 10.5)
  place_associated_with_family VARCHAR(255),

  -- Prominent Member of Family (RDA 10.6)
  prominent_member_of_family VARCHAR(255),

  -- Hereditary Title (RDA 10.7)
  hereditary_title VARCHAR(255),

  -- Family History (RDA 10.9)
  family_history TEXT,

  -- Attributes for Corporate Bodies (RDA Chapter 11)

  -- Place Associated with Corporate Body (RDA 11.3)
  place_associated_with_corporate_body VARCHAR(255),

  -- Date Associated with Corporate Body (RDA 11.4)
  date_of_establishment VARCHAR(50),
  date_of_termination VARCHAR(50),

  -- Associated Institution (RDA 11.5)
  associated_institution VARCHAR(255),

  -- Number of Conference (RDA 11.6)
  number_of_conference VARCHAR(50),

  -- Other Designation Associated with Corporate Body (RDA 11.7)
  corporate_body_designation VARCHAR(255),

  -- Language of Corporate Body (RDA 11.8)
  language_of_corporate_body VARCHAR(10)[],

  -- Corporate History (RDA 11.11)
  corporate_history TEXT,

  -- Authority Control
  authority_id VARCHAR(100),  -- VIAF, LCNAF, ISNI, etc.
  authority_source VARCHAR(50),  -- LCNAF, VIAF, ISNI, etc.
  authority_uri TEXT,

  -- System metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_agents_preferred_name ON agents(preferred_name);
CREATE INDEX idx_agents_type ON agents(agent_type);
CREATE INDEX idx_agents_authority_id ON agents(authority_id);
CREATE INDEX idx_agents_variant_names ON agents USING gin(variant_names);

-- ============================================================================
-- SECTION 6: RELATIONSHIPS
-- RDA Appendices I, J, K (Relationship Designators)
-- ============================================================================

-- Work-Agent Relationships (Creators and Contributors)
-- RDA Appendix I

CREATE TABLE work_agent_relationships (
  relationship_id SERIAL PRIMARY KEY,
  work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,

  -- RDA Relationship Designator (Appendix I)
  relationship_role VARCHAR(100) NOT NULL,
  -- Common values: author, illustrator, photographer, composer,
  --                lyricist, choreographer, filmmaker, screenwriter, etc.

  -- Role specificity and notes
  role_note TEXT,

  -- Sequence (for ordering multiple creators)
  sequence_number INTEGER,

  -- System metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_work_agent_role UNIQUE(work_id, agent_id, relationship_role, sequence_number)
);

CREATE INDEX idx_work_agent_work_id ON work_agent_relationships(work_id);
CREATE INDEX idx_work_agent_agent_id ON work_agent_relationships(agent_id);
CREATE INDEX idx_work_agent_role ON work_agent_relationships(relationship_role);

-- Expression-Agent Relationships
-- RDA Appendix I

CREATE TABLE expression_agent_relationships (
  relationship_id SERIAL PRIMARY KEY,
  expression_id INTEGER NOT NULL REFERENCES expressions(expression_id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,

  -- RDA Relationship Designator
  relationship_role VARCHAR(100) NOT NULL,
  -- Common values: translator, narrator, performer, conductor,
  --                editor, abridger, adapter, etc.

  role_note TEXT,
  sequence_number INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_expression_agent_role UNIQUE(expression_id, agent_id, relationship_role, sequence_number)
);

CREATE INDEX idx_expression_agent_expression_id ON expression_agent_relationships(expression_id);
CREATE INDEX idx_expression_agent_agent_id ON expression_agent_relationships(agent_id);
CREATE INDEX idx_expression_agent_role ON expression_agent_relationships(relationship_role);

-- Manifestation-Agent Relationships
-- RDA Appendix I

CREATE TABLE manifestation_agent_relationships (
  relationship_id SERIAL PRIMARY KEY,
  manifestation_id INTEGER NOT NULL REFERENCES manifestations(manifestation_id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,

  -- RDA Relationship Designator
  relationship_role VARCHAR(100) NOT NULL,
  -- Common values: publisher, manufacturer, distributor, printer,
  --                book_designer, bookbinder, etc.

  role_note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_manifestation_agent_role UNIQUE(manifestation_id, agent_id, relationship_role)
);

CREATE INDEX idx_manifestation_agent_manifestation_id ON manifestation_agent_relationships(manifestation_id);
CREATE INDEX idx_manifestation_agent_agent_id ON manifestation_agent_relationships(agent_id);
CREATE INDEX idx_manifestation_agent_role ON manifestation_agent_relationships(relationship_role);

-- Work-to-Work Relationships
-- RDA Appendix J

CREATE TABLE work_relationships (
  relationship_id SERIAL PRIMARY KEY,
  source_work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
  target_work_id INTEGER NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,

  -- RDA Relationship Designator (Appendix J.2)
  relationship_type VARCHAR(100) NOT NULL,
  -- Common values:
  --   adaptation_of, based_on, parody_of, sequel_to, prequel_to,
  --   dramatization_of, novelization_of, screenplay_based_on,
  --   libretto_based_on, musical_setting_of, motion_picture_adaptation_of,
  --   television_adaptation_of, video_game_adaptation_of, etc.

  relationship_note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_work_relationship UNIQUE(source_work_id, target_work_id, relationship_type),
  CONSTRAINT prevent_self_reference CHECK (source_work_id != target_work_id)
);

CREATE INDEX idx_work_relationships_source ON work_relationships(source_work_id);
CREATE INDEX idx_work_relationships_target ON work_relationships(target_work_id);
CREATE INDEX idx_work_relationships_type ON work_relationships(relationship_type);

-- Expression-to-Expression Relationships
-- RDA Appendix J

CREATE TABLE expression_relationships (
  relationship_id SERIAL PRIMARY KEY,
  source_expression_id INTEGER NOT NULL REFERENCES expressions(expression_id) ON DELETE CASCADE,
  target_expression_id INTEGER NOT NULL REFERENCES expressions(expression_id) ON DELETE CASCADE,

  -- RDA Relationship Designator
  relationship_type VARCHAR(100) NOT NULL,
  -- Common values: translation_of, revision_of, abridgement_of, etc.

  relationship_note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_expression_relationship UNIQUE(source_expression_id, target_expression_id, relationship_type),
  CONSTRAINT prevent_self_reference CHECK (source_expression_id != target_expression_id)
);

CREATE INDEX idx_expression_relationships_source ON expression_relationships(source_expression_id);
CREATE INDEX idx_expression_relationships_target ON expression_relationships(target_expression_id);

-- Manifestation-to-Manifestation Relationships
-- RDA Appendix J

CREATE TABLE manifestation_relationships (
  relationship_id SERIAL PRIMARY KEY,
  source_manifestation_id INTEGER NOT NULL REFERENCES manifestations(manifestation_id) ON DELETE CASCADE,
  target_manifestation_id INTEGER NOT NULL REFERENCES manifestations(manifestation_id) ON DELETE CASCADE,

  -- RDA Relationship Designator
  relationship_type VARCHAR(100) NOT NULL,
  -- Common values: reproduction_of, reprint_of, facsimile_of, etc.

  relationship_note TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_manifestation_relationship UNIQUE(source_manifestation_id, target_manifestation_id, relationship_type),
  CONSTRAINT prevent_self_reference CHECK (source_manifestation_id != target_manifestation_id)
);

CREATE INDEX idx_manifestation_relationships_source ON manifestation_relationships(source_manifestation_id);
CREATE INDEX idx_manifestation_relationships_target ON manifestation_relationships(target_manifestation_id);

-- ============================================================================
-- SECTION 7: RDA CONTROLLED VOCABULARIES
-- ============================================================================

-- RDA Content Types (RDA 6.9)
CREATE TABLE rda_content_types (
  content_type_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  definition TEXT,
  scope_note TEXT,
  rda_reference VARCHAR(50)
);

-- RDA Media Types (RDA 3.2)
CREATE TABLE rda_media_types (
  media_type_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  definition TEXT,
  scope_note TEXT,
  rda_reference VARCHAR(50)
);

-- RDA Carrier Types (RDA 3.3)
CREATE TABLE rda_carrier_types (
  carrier_type_id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  definition TEXT,
  scope_note TEXT,
  media_type_code VARCHAR(50) REFERENCES rda_media_types(code),
  rda_reference VARCHAR(50)
);

-- ============================================================================
-- SECTION 8: TRIGGERS FOR AUTO-UPDATES
-- ============================================================================

-- Auto-update timestamp for works
CREATE OR REPLACE FUNCTION update_works_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_works_updated_at
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION update_works_updated_at();

-- Auto-update timestamp for expressions
CREATE OR REPLACE FUNCTION update_expressions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_expressions_updated_at
  BEFORE UPDATE ON expressions
  FOR EACH ROW
  EXECUTE FUNCTION update_expressions_updated_at();

-- Auto-update timestamp for manifestations
CREATE OR REPLACE FUNCTION update_manifestations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_manifestations_updated_at
  BEFORE UPDATE ON manifestations
  FOR EACH ROW
  EXECUTE FUNCTION update_manifestations_updated_at();

-- Auto-update timestamp for items
CREATE OR REPLACE FUNCTION update_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_items_updated_at();

-- Auto-update timestamp for agents
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();

-- ============================================================================
-- SECTION 9: VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Materialized view for available items by manifestation
CREATE MATERIALIZED VIEW mv_manifestation_availability AS
SELECT
  m.manifestation_id,
  m.title_proper,
  m.isbn,
  COUNT(i.item_id) as total_items,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'available') as available_items,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'checked_out') as checked_out_items,
  COUNT(i.item_id) FILTER (WHERE i.circulation_status = 'on_hold') as on_hold_items
FROM manifestations m
LEFT JOIN items i ON m.manifestation_id = i.manifestation_id AND i.is_withdrawn = FALSE
WHERE m.is_deleted = FALSE
GROUP BY m.manifestation_id, m.title_proper, m.isbn;

CREATE UNIQUE INDEX idx_mv_manifestation_availability_id ON mv_manifestation_availability(manifestation_id);

-- View for complete bibliographic record (Work -> Expression -> Manifestation)
CREATE OR REPLACE VIEW v_complete_bibliographic_record AS
SELECT
  w.work_id,
  w.preferred_title as work_title,
  w.form_of_work,
  w.date_of_work,
  e.expression_id,
  e.language_of_expression,
  e.content_type,
  m.manifestation_id,
  m.title_proper as manifestation_title,
  m.statement_of_responsibility,
  m.publisher_name,
  m.date_of_publication,
  m.isbn,
  m.media_type,
  m.carrier_type,
  m.extent
FROM works w
JOIN expressions e ON w.work_id = e.work_id
JOIN manifestations m ON e.expression_id = m.expression_id
WHERE w.is_deleted = FALSE AND m.is_deleted = FALSE;

-- ============================================================================
-- SECTION 10: LEGACY COMPATIBILITY (TEMPORARY)
-- For backward compatibility during migration period
-- ============================================================================

-- Add reference from old books table to new manifestations table
-- This allows dual operation during transition
ALTER TABLE books ADD COLUMN IF NOT EXISTS manifestation_id INTEGER REFERENCES manifestations(manifestation_id);
ALTER TABLE books ADD COLUMN IF NOT EXISTS migrated_to_rda BOOLEAN DEFAULT FALSE;
ALTER TABLE books ADD COLUMN IF NOT EXISTS migration_date TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_books_manifestation_id ON books(manifestation_id);
CREATE INDEX IF NOT EXISTS idx_books_migrated ON books(migrated_to_rda);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
