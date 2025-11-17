-- ============================================================================
-- RDA CONTROLLED VOCABULARIES SEED DATA
-- Populates RDA Content Types, Media Types, and Carrier Types
--
-- Based on:
-- - RDA Registry (https://www.rdaregistry.info/)
-- - RDA Toolkit specifications
--
-- Version: 1.0
-- Date: 2025-11-17
-- ============================================================================

-- ============================================================================
-- SECTION 1: RDA CONTENT TYPES (RDA 6.9)
-- A categorization reflecting the fundamental form of communication in which
-- the content is expressed and the human sense through which it is intended
-- to be perceived
-- ============================================================================

INSERT INTO rda_content_types (code, label, definition, rda_reference) VALUES

-- Text-based content
('txt', 'text',
 'Content expressed through a form of notation for language intended to be perceived visually.',
 'RDA 6.9.1.3'),

('tct', 'tactile text',
 'Content expressed through a form of notation for language intended to be perceived through touch.',
 'RDA 6.9.1.3'),

-- Cartographic content
('cri', 'cartographic image',
 'Content expressed through line, shape, shading, etc., intended to be perceived visually as a still image or images representing the Earth, celestial bodies, imaginary places, or another location.',
 'RDA 6.9.1.3'),

('crm', 'cartographic moving image',
 'Content expressed through images intended to be perceived as moving, representing the Earth, celestial bodies, imaginary places, or another location.',
 'RDA 6.9.1.3'),

('crt', 'cartographic tactile image',
 'Content expressed through line, shape, shading, etc., intended to be perceived through touch as a still image or images representing the Earth or celestial bodies.',
 'RDA 6.9.1.3'),

('crn', 'cartographic tactile three-dimensional form',
 'Content expressed through a form intended to be perceived through touch as a three-dimensional form representing the Earth or celestial bodies.',
 'RDA 6.9.1.3'),

('crf', 'cartographic three-dimensional form',
 'Content expressed through a form intended to be perceived visually in three dimensions representing the Earth or celestial bodies.',
 'RDA 6.9.1.3'),

-- Musical content
('ntm', 'notated music',
 'Content expressed through a form of musical notation intended to be perceived visually.',
 'RDA 6.9.1.3'),

('ntv', 'notated movement',
 'Content expressed through a form of notation for movement intended to be perceived visually.',
 'RDA 6.9.1.3'),

('tcn', 'tactile notated music',
 'Content expressed through a form of musical notation intended to be perceived through touch.',
 'RDA 6.9.1.3'),

('tcm', 'tactile notated movement',
 'Content expressed through a form of notation for movement intended to be perceived through touch.',
 'RDA 6.9.1.3'),

('prm', 'performed music',
 'Content expressed through music in an audible form.',
 'RDA 6.9.1.3'),

-- Spoken content
('spw', 'spoken word',
 'Content expressed through language in an audible form.',
 'RDA 6.9.1.3'),

('snd', 'sounds',
 'Content other than language or music, expressed in an audible form.',
 'RDA 6.9.1.3'),

-- Image content
('sti', 'still image',
 'Content expressed through line, shape, shading, etc., intended to be perceived visually as a still image or images in two dimensions.',
 'RDA 6.9.1.3'),

('tci', 'tactile image',
 'Content expressed through line, shape, shading, etc., intended to be perceived through touch as a still image or images in two dimensions.',
 'RDA 6.9.1.3'),

-- Moving images
('tdi', 'two-dimensional moving image',
 'Content expressed through images intended to be perceived as moving, in two dimensions.',
 'RDA 6.9.1.3'),

('tdm', 'three-dimensional moving image',
 'Content expressed through images intended to be perceived as moving, in three dimensions.',
 'RDA 6.9.1.3'),

-- Three-dimensional forms
('tdf', 'three-dimensional form',
 'Content expressed through a form or forms intended to be perceived visually in three dimensions.',
 'RDA 6.9.1.3'),

('tcf', 'tactile three-dimensional form',
 'Content expressed through a form or forms intended to be perceived through touch as a three-dimensional form or forms.',
 'RDA 6.9.1.3'),

-- Computer content
('cod', 'computer dataset',
 'Content expressed through digitally encoded data intended to be processed by a computer.',
 'RDA 6.9.1.3'),

('cop', 'computer program',
 'Content expressed through digitally encoded instructions intended to be processed and performed by a computer.',
 'RDA 6.9.1.3'),

-- Other
('xxx', 'other',
 'A content type for content expressed through a form or forms not covered by another term in the list.',
 'RDA 6.9.1.3'),

('zzz', 'unspecified',
 'The content type is not specified.',
 'RDA 6.9.1.3');

-- ============================================================================
-- SECTION 2: RDA MEDIA TYPES (RDA 3.2)
-- A categorization reflecting the general type of intermediation device
-- required to view, play, run, etc., the content of a resource
-- ============================================================================

INSERT INTO rda_media_types (code, label, definition, rda_reference) VALUES

('n', 'unmediated',
 'Media used to store content designed to be perceived directly through one or more of the human senses without the aid of an intermediating device.',
 'RDA 3.2.1.3'),

('s', 'audio',
 'Media used to store content designed to be perceived aurally through playback of a recording, film, etc., using a playback device.',
 'RDA 3.2.1.3'),

('v', 'video',
 'Media used to store moving images, designed to be perceived visually, with or without sound, using a playback device.',
 'RDA 3.2.1.3'),

('c', 'computer',
 'Media used to store electronic content designed to be processed and accessed using a computer.',
 'RDA 3.2.1.3'),

('g', 'projected',
 'Media used to store moving or still images designed to be projected onto a screen, etc., for viewing.',
 'RDA 3.2.1.3'),

('h', 'microform',
 'Media used to store reduced-size images that are designed to be magnified for viewing.',
 'RDA 3.2.1.3'),

('e', 'stereographic',
 'Media used to store pairs of still or moving images designed to be viewed through a device such as a stereoscope or head-mounted display to create the effect of three dimensions.',
 'RDA 3.2.1.3'),

('x', 'other',
 'A media type for media not covered by another term in the list.',
 'RDA 3.2.1.3'),

('z', 'unspecified',
 'The media type is not specified.',
 'RDA 3.2.1.3');

-- ============================================================================
-- SECTION 3: RDA CARRIER TYPES (RDA 3.3)
-- A categorization reflecting the format of the storage medium and housing
-- of a carrier in combination with the type of intermediation device required
-- to render, view, run, etc., the content of a resource
-- ============================================================================

INSERT INTO rda_carrier_types (code, label, definition, media_type_code, rda_reference) VALUES

-- UNMEDIATED CARRIERS (Media type: n)
('nc', 'volume',
 'A carrier consisting of one or more sheets bound or fastened together to form a single unit.',
 'n', 'RDA 3.3.1.3'),

('nb', 'sheet',
 'A carrier consisting of a flat, thin piece of paper, plastic, etc.',
 'n', 'RDA 3.3.1.3'),

('no', 'card',
 'A carrier consisting of a small sheet of opaque material.',
 'n', 'RDA 3.3.1.3'),

('nn', 'flipchart',
 'A carrier consisting of a hinging device holding two or more sheets designed to be turned over to facilitate presentation.',
 'n', 'RDA 3.3.1.3'),

('nr', 'roll',
 'A carrier consisting of a wound length of paper, film, tape, etc.',
 'n', 'RDA 3.3.1.3'),

('nz', 'object',
 'A carrier consisting of a three-dimensional artifact, a replica of an artifact, or a naturally-occurring entity.',
 'n', 'RDA 3.3.1.3'),

-- AUDIO CARRIERS (Media type: s)
('sd', 'audio disc',
 'A carrier consisting of a disc on which sound vibrations or digital sound signals have been registered.',
 's', 'RDA 3.3.1.3'),

('ss', 'audiocassette',
 'A carrier consisting of a cassette containing an audiotape.',
 's', 'RDA 3.3.1.3'),

('st', 'audiotape reel',
 'A carrier consisting of an open reel holding a length of audiotape to be threaded on a playback device.',
 's', 'RDA 3.3.1.3'),

('se', 'audio cylinder',
 'A carrier consisting of a cylinder on which sound vibrations have been registered.',
 's', 'RDA 3.3.1.3'),

('sg', 'sound-track reel',
 'A carrier consisting of an open reel holding a length of film on which sound is registered.',
 's', 'RDA 3.3.1.3'),

('si', 'sound-track film',
 'A carrier consisting of a roll of film on which sound is registered.',
 's', 'RDA 3.3.1.3'),

('sq', 'audio roll',
 'A carrier consisting of a wound roll of paper on which sound is mechanically registered.',
 's', 'RDA 3.3.1.3'),

('sz', 'other audio carrier',
 'An audio carrier not covered by another term in the list.',
 's', 'RDA 3.3.1.3'),

-- VIDEO CARRIERS (Media type: v)
('vd', 'videodisc',
 'A carrier consisting of a disc on which video signals, with or without sound, are registered.',
 'v', 'RDA 3.3.1.3'),

('vf', 'videocassette',
 'A carrier consisting of a cassette containing a videotape.',
 'v', 'RDA 3.3.1.3'),

('vr', 'videotape reel',
 'A carrier consisting of an open reel holding a length of videotape to be threaded on a playback device.',
 'v', 'RDA 3.3.1.3'),

('vc', 'videocartridge',
 'A carrier consisting of a cartridge containing a videotape.',
 'v', 'RDA 3.3.1.3'),

('vz', 'other video carrier',
 'A video carrier not covered by another term in the list.',
 'v', 'RDA 3.3.1.3'),

-- COMPUTER CARRIERS (Media type: c)
('cr', 'online resource',
 'A carrier consisting of a digital resource accessed by means of hardware and software connections to a communications network.',
 'c', 'RDA 3.3.1.3'),

('cd', 'computer disc',
 'A carrier consisting of a disc on which digital content is stored.',
 'c', 'RDA 3.3.1.3'),

('ce', 'computer disc cartridge',
 'A carrier consisting of a cartridge containing one or more computer discs.',
 'c', 'RDA 3.3.1.3'),

('ca', 'computer tape cartridge',
 'A carrier consisting of a cartridge containing a computer tape.',
 'c', 'RDA 3.3.1.3'),

('cb', 'computer tape cassette',
 'A carrier consisting of a cassette containing a computer tape.',
 'c', 'RDA 3.3.1.3'),

('cf', 'computer tape reel',
 'A carrier consisting of an open reel holding a length of computer tape to be threaded on a playback device.',
 'c', 'RDA 3.3.1.3'),

('ck', 'computer card',
 'A carrier consisting of a card containing digitally encoded data.',
 'c', 'RDA 3.3.1.3'),

('cz', 'other computer carrier',
 'A computer carrier not covered by another term in the list.',
 'c', 'RDA 3.3.1.3'),

-- MICROFORM CARRIERS (Media type: h)
('ha', 'aperture card',
 'A carrier consisting of a card with one or more rectangular openings or apertures holding frames of microfilm.',
 'h', 'RDA 3.3.1.3'),

('hb', 'microfiche',
 'A carrier consisting of a small sheet of film bearing a number of micro-images in a two-dimensional array.',
 'h', 'RDA 3.3.1.3'),

('hc', 'microfiche cassette',
 'A carrier consisting of a cassette containing uncut microfiches.',
 'h', 'RDA 3.3.1.3'),

('hd', 'microfilm cartridge',
 'A carrier consisting of a cartridge containing a microfilm.',
 'h', 'RDA 3.3.1.3'),

('he', 'microfilm cassette',
 'A carrier consisting of a cassette containing a microfilm.',
 'h', 'RDA 3.3.1.3'),

('hf', 'microfilm reel',
 'A carrier consisting of an open reel holding a length of microfilm to be threaded on a reader or scanner.',
 'h', 'RDA 3.3.1.3'),

('hg', 'microfilm roll',
 'A carrier consisting of a wound length of microfilm.',
 'h', 'RDA 3.3.1.3'),

('hh', 'microfilm slip',
 'A carrier consisting of a short strip of microfilm cut from a roll.',
 'h', 'RDA 3.3.1.3'),

('hj', 'microopaque',
 'A carrier consisting of a sheet of opaque material bearing a number of micro-images in a two-dimensional array.',
 'h', 'RDA 3.3.1.3'),

('hz', 'other microform carrier',
 'A microform carrier not covered by another term in the list.',
 'h', 'RDA 3.3.1.3'),

-- PROJECTED CARRIERS (Media type: g)
('gc', 'film cartridge',
 'A carrier consisting of a cartridge containing a motion picture film.',
 'g', 'RDA 3.3.1.3'),

('gd', 'filmstrip',
 'A carrier consisting of a roll of film, with or without recorded sound, containing a succession of images for projection one at a time.',
 'g', 'RDA 3.3.1.3'),

('gf', 'film cassette',
 'A carrier consisting of a cassette containing a motion picture film.',
 'g', 'RDA 3.3.1.3'),

('gs', 'slide',
 'A carrier consisting of a small sheet of transparent material, usually in a protective mount, bearing an image designed for use with a slide projector or viewer.',
 'g', 'RDA 3.3.1.3'),

('gt', 'overhead transparency',
 'A carrier consisting of a sheet of transparent material, with or without a protective mount, bearing an image designed for use with an overhead projector.',
 'g', 'RDA 3.3.1.3'),

('mo', 'film roll',
 'A carrier consisting of a wound length of film.',
 'g', 'RDA 3.3.1.3'),

('mr', 'film reel',
 'A carrier consisting of an open reel holding a length of film to be threaded on a projector or viewer.',
 'g', 'RDA 3.3.1.3'),

('gz', 'other projected carrier',
 'A projected carrier not covered by another term in the list.',
 'g', 'RDA 3.3.1.3'),

-- STEREOGRAPHIC CARRIERS (Media type: e)
('eh', 'stereograph card',
 'A carrier consisting of a card bearing stereographic images.',
 'e', 'RDA 3.3.1.3'),

('es', 'stereograph disc',
 'A carrier consisting of a disc with openings around the perimeter holding pairs of still images designed for use with a stereograph viewer.',
 'e', 'RDA 3.3.1.3'),

('ez', 'other stereographic carrier',
 'A stereographic carrier not covered by another term in the list.',
 'e', 'RDA 3.3.1.3'),

-- UNSPECIFIED/OTHER
('zu', 'unspecified carrier',
 'The carrier type is not specified.',
 'z', 'RDA 3.3.1.3'),

('xx', 'other carrier',
 'A carrier not covered by another term in the list.',
 'x', 'RDA 3.3.1.3');

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================================

REFRESH MATERIALIZED VIEW mv_manifestation_availability;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================

-- Verify data loaded
SELECT 'Content Types loaded: ' || COUNT(*) FROM rda_content_types;
SELECT 'Media Types loaded: ' || COUNT(*) FROM rda_media_types;
SELECT 'Carrier Types loaded: ' || COUNT(*) FROM rda_carrier_types;
