--
-- PostgreSQL database dump
--

\restrict TFexwwKq85hDPOVlMNALA5zEVjD5PSPDnjyaZMVvuQMO6AELAMmHsi9x1XLKY08

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: refresh_book_availability(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_book_availability() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_book_availability;
END;
$$;


--
-- Name: sync_item_circulation_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_item_circulation_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- When a new borrowing is created (checkout)
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE items
        SET circulation_status = 'checked_out',
            status_changed_at = CURRENT_TIMESTAMP
        WHERE item_id = NEW.item_id;

    -- When a borrowing is returned
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'returned' THEN
        UPDATE items
        SET circulation_status = 'available',
            status_changed_at = CURRENT_TIMESTAMP
        WHERE item_id = NEW.item_id;

    -- When a borrowing is marked overdue (keep as checked_out)
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'overdue' THEN
        UPDATE items
        SET status_changed_at = CURRENT_TIMESTAMP
        WHERE item_id = NEW.item_id;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: update_book_availability(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_book_availability() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE books SET available_copies = available_copies - 1 WHERE book_id = NEW.book_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'returned' THEN
        UPDATE books SET available_copies = available_copies + 1 WHERE book_id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_content_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_content_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_event_participant_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_event_participant_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events
        SET current_participants = current_participants + 1
        WHERE event_id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events
        SET current_participants = current_participants - 1
        WHERE event_id = OLD.event_id;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_item_status_changed_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_item_status_changed_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.circulation_status != NEW.circulation_status THEN
        NEW.status_changed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: age_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.age_ratings (
    rating_id integer NOT NULL,
    rating_name character varying(100) NOT NULL,
    min_age integer NOT NULL,
    max_age integer,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: age_ratings_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.age_ratings_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: age_ratings_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.age_ratings_rating_id_seq OWNED BY public.age_ratings.rating_id;


--
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_comments (
    comment_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    parent_comment_id integer,
    comment_text text NOT NULL,
    is_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: blog_comments_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_comments_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_comments_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_comments_comment_id_seq OWNED BY public.blog_comments.comment_id;


--
-- Name: blog_post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_post_likes (
    like_id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: blog_post_likes_like_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_post_likes_like_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_post_likes_like_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_post_likes_like_id_seq OWNED BY public.blog_post_likes.like_id;


--
-- Name: blog_post_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.blog_post_stats AS
SELECT
    NULL::integer AS post_id,
    NULL::character varying(255) AS title,
    NULL::integer AS author_id,
    NULL::character varying(255) AS author_email,
    NULL::text AS author_name,
    NULL::character varying(50) AS status,
    NULL::integer AS view_count,
    NULL::bigint AS comment_count,
    NULL::bigint AS like_count,
    NULL::timestamp without time zone AS published_at,
    NULL::timestamp without time zone AS created_at;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    post_id integer NOT NULL,
    author_id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image_url text,
    category character varying(100),
    tags text[],
    status character varying(50) DEFAULT 'draft'::character varying,
    rejection_reason text,
    admin_notes text,
    view_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    published_at timestamp without time zone,
    scheduled_for timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_by integer,
    approved_at timestamp without time zone
);


--
-- Name: TABLE blog_posts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.blog_posts IS 'Blog posts submitted by patrons and admins';


--
-- Name: blog_posts_post_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_post_id_seq OWNED BY public.blog_posts.post_id;


--
-- Name: book_contributors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_contributors (
    book_contributor_id integer NOT NULL,
    book_id integer NOT NULL,
    contributor_id integer NOT NULL,
    role character varying(100) NOT NULL,
    sequence_number integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: book_contributors_book_contributor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_contributors_book_contributor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: book_contributors_book_contributor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_contributors_book_contributor_id_seq OWNED BY public.book_contributors.book_contributor_id;


--
-- Name: book_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_suggestions (
    suggestion_id integer NOT NULL,
    patron_id character varying(20) NOT NULL,
    title character varying(500) NOT NULL,
    authors text NOT NULL,
    isbn character varying(20),
    category character varying(100),
    recommended_for character varying(100),
    reason text NOT NULL,
    interest_level character varying(50),
    status character varying(50) DEFAULT 'pending'::character varying,
    admin_response text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_at timestamp without time zone,
    reviewed_by integer
);


--
-- Name: TABLE book_suggestions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.book_suggestions IS 'Book suggestions from patrons';


--
-- Name: book_suggestions_suggestion_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_suggestions_suggestion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: book_suggestions_suggestion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_suggestions_suggestion_id_seq OWNED BY public.book_suggestions.suggestion_id;


--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    book_id integer NOT NULL,
    isbn character varying(13),
    isbn_10 character varying(10),
    issn character varying(9),
    other_identifier character varying(255),
    title character varying(500) NOT NULL,
    subtitle text,
    statement_of_responsibility text,
    edition_statement character varying(255),
    place_of_publication character varying(255),
    publisher character varying(255),
    publication_year integer,
    copyright_year integer,
    series_title character varying(500),
    series_number character varying(100),
    extent character varying(255),
    dimensions character varying(100),
    content_type character varying(50) DEFAULT 'txt'::character varying,
    media_type character varying(50) DEFAULT 'n'::character varying,
    carrier_type character varying(50) DEFAULT 'nc'::character varying,
    subjects text[],
    description text,
    notes text[],
    age_rating character varying(50),
    target_audience character varying(100),
    language character varying(10) DEFAULT 'eng'::character varying,
    additional_languages character varying(10)[],
    collection_id integer,
    call_number character varying(100),
    resource_type character varying(50) DEFAULT 'book'::character varying,
    cover_image_url text,
    thumbnail_url text,
    cataloged_by character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: books_book_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.books_book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: books_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.books_book_id_seq OWNED BY public.books.book_id;


--
-- Name: borrowings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.borrowings (
    borrowing_id integer NOT NULL,
    patron_id character varying(20) NOT NULL,
    item_id integer NOT NULL,
    checkout_date date NOT NULL,
    due_date date NOT NULL,
    return_date date,
    status character varying(50) DEFAULT 'active'::character varying,
    renewal_count integer DEFAULT 0,
    fine_amount numeric(10,2) DEFAULT 0.00,
    fine_paid boolean DEFAULT false,
    notes text,
    checked_out_by character varying(100),
    checked_in_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT borrowings_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'returned'::character varying, 'overdue'::character varying])::text[])))
);


--
-- Name: borrowings_borrowing_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.borrowings_borrowing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: borrowings_borrowing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.borrowings_borrowing_id_seq OWNED BY public.borrowings.borrowing_id;


--
-- Name: collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collections (
    collection_id integer NOT NULL,
    collection_name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: collections_collection_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.collections_collection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: collections_collection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.collections_collection_id_seq OWNED BY public.collections.collection_id;


--
-- Name: content_moderation_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_moderation_log (
    log_id integer NOT NULL,
    content_type character varying(50) NOT NULL,
    content_id integer NOT NULL,
    action character varying(50) NOT NULL,
    moderator_id integer NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: content_moderation_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_moderation_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_moderation_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_moderation_log_log_id_seq OWNED BY public.content_moderation_log.log_id;


--
-- Name: contributors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contributors (
    contributor_id integer NOT NULL,
    name character varying(500) NOT NULL,
    name_type character varying(20) NOT NULL,
    date_of_birth character varying(50),
    date_of_death character varying(50),
    date_established character varying(50),
    date_terminated character varying(50),
    alternate_names text[],
    biographical_note text,
    authority_id character varying(100),
    authority_source character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contributors_name_type_check CHECK (((name_type)::text = ANY ((ARRAY['person'::character varying, 'organization'::character varying])::text[])))
);


--
-- Name: contributors_contributor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contributors_contributor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contributors_contributor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contributors_contributor_id_seq OWNED BY public.contributors.contributor_id;


--
-- Name: cowork_bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cowork_bookings (
    booking_id integer NOT NULL,
    patron_id character varying(20),
    booking_date date NOT NULL,
    time_slot character varying(50) NOT NULL,
    booking_type character varying(20),
    desk_number character varying(20),
    status character varying(20) DEFAULT 'pending'::character varying,
    request_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cowork_bookings_booking_type_check CHECK (((booking_type)::text = ANY ((ARRAY['day'::character varying, 'half-day'::character varying])::text[]))),
    CONSTRAINT cowork_bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: cowork_bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cowork_bookings_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cowork_bookings_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cowork_bookings_booking_id_seq OWNED BY public.cowork_bookings.booking_id;


--
-- Name: cowork_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cowork_subscriptions (
    subscription_id integer NOT NULL,
    patron_id character varying(20),
    subscription_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    price numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cowork_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT cowork_subscriptions_subscription_type_check CHECK (((subscription_type)::text = ANY ((ARRAY['full-day'::character varying, 'half-day'::character varying, 'weekend-only'::character varying])::text[])))
);


--
-- Name: cowork_subscriptions_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cowork_subscriptions_subscription_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cowork_subscriptions_subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cowork_subscriptions_subscription_id_seq OWNED BY public.cowork_subscriptions.subscription_id;


--
-- Name: event_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_registrations (
    registration_id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer,
    patron_id character varying(20),
    attendee_name character varying(255) NOT NULL,
    attendee_email character varying(255) NOT NULL,
    attendee_phone character varying(20),
    status character varying(50) DEFAULT 'confirmed'::character varying,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    confirmation_sent boolean DEFAULT false,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: event_registrations_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_registrations_registration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_registrations_registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_registrations_registration_id_seq OWNED BY public.event_registrations.registration_id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    event_id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NOT NULL,
    category character varying(100),
    event_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    location character varying(255),
    max_participants integer,
    current_participants integer DEFAULT 0,
    featured_image_url text,
    fee numeric(10,2) DEFAULT 0,
    registration_enabled boolean DEFAULT true,
    registration_deadline timestamp without time zone,
    send_confirmation_email boolean DEFAULT true,
    status character varying(50) DEFAULT 'draft'::character varying,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    published_at timestamp without time zone
);


--
-- Name: TABLE events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.events IS 'Library events and activities';


--
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;


--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_line_items (
    line_item_id integer NOT NULL,
    invoice_id integer,
    description character varying(500) NOT NULL,
    quantity numeric(10,2) DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    item_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE invoice_line_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.invoice_line_items IS 'Stores line items for invoices, supporting multiple items per invoice';


--
-- Name: invoice_line_items_line_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoice_line_items_line_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoice_line_items_line_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoice_line_items_line_item_id_seq OWNED BY public.invoice_line_items.line_item_id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    invoice_id integer NOT NULL,
    patron_id character varying(20),
    invoice_number character varying(50) NOT NULL,
    invoice_type character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_mode character varying(50),
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    issue_date date DEFAULT CURRENT_DATE,
    due_date date NOT NULL,
    payment_date date,
    pdf_url text,
    sent_via_email boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    custom_member_name character varying(255),
    custom_member_email character varying(255),
    custom_member_phone character varying(20),
    custom_member_address text,
    notes text,
    CONSTRAINT invoices_invoice_type_check CHECK (((invoice_type)::text = ANY ((ARRAY['membership'::character varying, 'cowork'::character varying])::text[]))),
    CONSTRAINT invoices_payment_mode_check CHECK (((payment_mode)::text = ANY ((ARRAY['UPI'::character varying, 'Cash'::character varying, 'Credit/Debit Card'::character varying, 'Bank Transfer'::character varying, 'Gift Coupon'::character varying])::text[]))),
    CONSTRAINT invoices_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'overdue'::character varying])::text[])))
);


--
-- Name: COLUMN invoices.custom_member_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.custom_member_name IS 'Custom member name when not linked to a patron';


--
-- Name: COLUMN invoices.custom_member_email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.custom_member_email IS 'Custom member email when not linked to a patron';


--
-- Name: COLUMN invoices.custom_member_phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.custom_member_phone IS 'Custom member phone when not linked to a patron';


--
-- Name: COLUMN invoices.custom_member_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.custom_member_address IS 'Custom member address when not linked to a patron';


--
-- Name: COLUMN invoices.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.invoices.notes IS 'Additional notes for the invoice';


--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoices_invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoices_invoice_id_seq OWNED BY public.invoices.invoice_id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    item_id integer NOT NULL,
    book_id integer NOT NULL,
    barcode character varying(50),
    accession_number character varying(100),
    call_number character varying(100),
    shelf_location character varying(100),
    current_location character varying(100),
    circulation_status character varying(50) DEFAULT 'available'::character varying NOT NULL,
    status_changed_at timestamp without time zone,
    condition character varying(50),
    condition_notes text,
    acquisition_date date,
    acquisition_price numeric(10,2),
    acquisition_source character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: COLUMN items.barcode; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.items.barcode IS 'Barcode for the item. Can be NULL initially and assigned later. Must be unique when assigned.';


--
-- Name: items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_item_id_seq OWNED BY public.items.item_id;


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_plans (
    plan_id integer NOT NULL,
    plan_name character varying(100) NOT NULL,
    duration_months integer NOT NULL,
    price numeric(10,2) NOT NULL,
    borrowing_limit integer DEFAULT 3,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: membership_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_plans_plan_id_seq OWNED BY public.membership_plans.plan_id;


--
-- Name: mv_book_availability; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.mv_book_availability AS
 SELECT b.book_id,
    b.isbn,
    b.title,
    count(i.item_id) AS total_items,
    count(i.item_id) FILTER (WHERE ((i.circulation_status)::text = 'available'::text)) AS available_items,
    count(i.item_id) FILTER (WHERE ((i.circulation_status)::text = 'checked_out'::text)) AS checked_out_items,
    count(i.item_id) FILTER (WHERE ((i.circulation_status)::text = 'on_hold'::text)) AS on_hold_items,
    count(i.item_id) FILTER (WHERE ((i.circulation_status)::text = ANY ((ARRAY['lost'::character varying, 'missing'::character varying, 'damaged'::character varying])::text[]))) AS unavailable_items
   FROM (public.books b
     LEFT JOIN public.items i ON ((b.book_id = i.book_id)))
  WHERE (b.is_active = true)
  GROUP BY b.book_id, b.isbn, b.title
  WITH NO DATA;


--
-- Name: new_arrivals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.new_arrivals (
    arrival_id integer NOT NULL,
    book_id integer NOT NULL,
    added_date date DEFAULT CURRENT_DATE,
    is_featured boolean DEFAULT false,
    added_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: new_arrivals_arrival_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.new_arrivals_arrival_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: new_arrivals_arrival_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.new_arrivals_arrival_id_seq OWNED BY public.new_arrivals.arrival_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer,
    notification_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notifications IS 'User notifications for content updates';


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: patrons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patrons (
    patron_id character varying(20) NOT NULL,
    user_id integer NOT NULL,
    membership_plan_id integer,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    date_of_birth date,
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    postal_code character varying(20),
    country character varying(100),
    membership_start_date date,
    membership_end_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tags text,
    CONSTRAINT patron_id_format CHECK (((patron_id)::text ~ '^[A-Z0-9]+$'::text))
);


--
-- Name: COLUMN patrons.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.patrons.tags IS 'Comma-separated tags for patron classification (e.g., "student,regular,vip")';


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    patron_id character varying(20) NOT NULL,
    book_id integer NOT NULL,
    rating integer,
    review_text text,
    is_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    testimonial_id integer NOT NULL,
    user_id integer NOT NULL,
    testimonial_text text NOT NULL,
    rating integer,
    display_name character varying(255),
    user_role character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_at timestamp without time zone,
    approved_by integer,
    CONSTRAINT testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: TABLE testimonials; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.testimonials IS 'Member testimonials';


--
-- Name: pending_content_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.pending_content_summary AS
 SELECT 'blog_posts'::text AS content_type,
    count(*) AS pending_count
   FROM public.blog_posts
  WHERE ((blog_posts.status)::text = 'pending'::text)
UNION ALL
 SELECT 'reviews'::text AS content_type,
    count(*) AS pending_count
   FROM public.reviews
  WHERE (reviews.is_approved = false)
UNION ALL
 SELECT 'suggestions'::text AS content_type,
    count(*) AS pending_count
   FROM public.book_suggestions
  WHERE ((book_suggestions.status)::text = 'pending'::text)
UNION ALL
 SELECT 'testimonials'::text AS content_type,
    count(*) AS pending_count
   FROM public.testimonials
  WHERE ((testimonials.status)::text = 'pending'::text);


--
-- Name: rda_carrier_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rda_carrier_types (
    code character varying(50) NOT NULL,
    label character varying(255) NOT NULL,
    media_type_code character varying(50),
    definition text
);


--
-- Name: rda_content_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rda_content_types (
    code character varying(50) NOT NULL,
    label character varying(255) NOT NULL,
    definition text,
    examples text
);


--
-- Name: rda_media_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rda_media_types (
    code character varying(50) NOT NULL,
    label character varying(255) NOT NULL,
    definition text
);


--
-- Name: reading_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_history (
    history_id integer NOT NULL,
    patron_id character varying(20),
    book_id integer,
    read_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: reading_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reading_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_history_history_id_seq OWNED BY public.reading_history.history_id;


--
-- Name: recommendation_list_books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_list_books (
    id integer NOT NULL,
    list_id integer NOT NULL,
    book_id integer NOT NULL,
    display_order integer DEFAULT 0,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recommendation_list_books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommendation_list_books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recommendation_list_books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recommendation_list_books_id_seq OWNED BY public.recommendation_list_books.id;


--
-- Name: recommendation_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_lists (
    list_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(100),
    display_order integer DEFAULT 0,
    created_by integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recommendation_lists_list_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommendation_lists_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recommendation_lists_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recommendation_lists_list_id_seq OWNED BY public.recommendation_lists.list_id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    reservation_id integer NOT NULL,
    patron_id character varying(20) NOT NULL,
    book_id integer NOT NULL,
    reservation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'pending'::character varying,
    expiry_date date,
    fulfilled_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reservations_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'ready'::character varying, 'fulfilled'::character varying, 'cancelled'::character varying, 'expired'::character varying])::text[])))
);


--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reservations_reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reservations_reservation_id_seq OWNED BY public.reservations.reservation_id;


--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: social_media_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_media_posts (
    post_id integer NOT NULL,
    platform character varying(50),
    post_content text,
    post_url text,
    image_url text,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT social_media_posts_platform_check CHECK (((platform)::text = ANY ((ARRAY['Instagram'::character varying, 'Facebook'::character varying])::text[])))
);


--
-- Name: social_media_posts_post_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.social_media_posts_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: social_media_posts_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.social_media_posts_post_id_seq OWNED BY public.social_media_posts.post_id;


--
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.testimonials_testimonial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.testimonials_testimonial_id_seq OWNED BY public.testimonials.testimonial_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(255) NOT NULL,
    phone character varying(20),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'patron'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'frozen'::character varying, 'closed'::character varying])::text[])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: website_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_cards (
    card_id integer NOT NULL,
    section_id integer,
    card_title character varying(255) NOT NULL,
    card_description text,
    card_image_url text,
    card_icon character varying(100),
    link_url text,
    link_text character varying(100),
    background_color character varying(50),
    text_color character varying(50),
    display_order integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_cards; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_cards IS 'Reusable card components for grid layouts';


--
-- Name: website_cards_card_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_cards_card_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_cards_card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_cards_card_id_seq OWNED BY public.website_cards.card_id;


--
-- Name: website_content_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_content_blocks (
    block_id integer NOT NULL,
    section_id integer,
    block_type character varying(50) NOT NULL,
    block_title character varying(255),
    block_content text,
    image_url text,
    link_url text,
    link_text character varying(255),
    display_order integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    custom_attributes jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_content_blocks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_content_blocks IS 'Flexible content blocks within sections';


--
-- Name: website_content_blocks_block_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_content_blocks_block_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_content_blocks_block_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_content_blocks_block_id_seq OWNED BY public.website_content_blocks.block_id;


--
-- Name: website_global_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_global_settings (
    setting_id integer NOT NULL,
    site_name character varying(255) DEFAULT 'Nuk Library'::character varying,
    site_tagline character varying(500),
    site_logo_url text,
    site_favicon_url text,
    contact_email character varying(255),
    contact_phone character varying(50),
    contact_address text,
    social_media_links jsonb,
    footer_text text,
    copyright_text character varying(500),
    analytics_code text,
    custom_head_code text,
    custom_footer_code text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_global_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_global_settings IS 'Global website settings and configuration';


--
-- Name: website_global_settings_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_global_settings_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_global_settings_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_global_settings_setting_id_seq OWNED BY public.website_global_settings.setting_id;


--
-- Name: website_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_media (
    media_id integer NOT NULL,
    media_name character varying(255) NOT NULL,
    media_url text NOT NULL,
    media_type character varying(50) NOT NULL,
    file_size integer,
    mime_type character varying(100),
    alt_text character varying(255),
    caption text,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_media; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_media IS 'Media library for uploaded images and files';


--
-- Name: website_media_media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_media_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_media_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_media_media_id_seq OWNED BY public.website_media.media_id;


--
-- Name: website_menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_menu_items (
    menu_item_id integer NOT NULL,
    menu_location character varying(50) NOT NULL,
    menu_text character varying(255) NOT NULL,
    menu_url character varying(500) NOT NULL,
    parent_id integer,
    display_order integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    target character varying(20) DEFAULT '_self'::character varying,
    icon character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_menu_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_menu_items IS 'Navigation menu items for header, footer, etc.';


--
-- Name: website_menu_items_menu_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_menu_items_menu_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_menu_items_menu_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_menu_items_menu_item_id_seq OWNED BY public.website_menu_items.menu_item_id;


--
-- Name: website_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_pages (
    page_id integer NOT NULL,
    page_title character varying(255) NOT NULL,
    page_slug character varying(255) NOT NULL,
    page_description text,
    meta_title character varying(255),
    meta_description text,
    is_published boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_pages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_pages IS 'Custom pages created by website admin';


--
-- Name: website_pages_page_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_pages_page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_pages_page_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_pages_page_id_seq OWNED BY public.website_pages.page_id;


--
-- Name: website_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_sections (
    section_id integer NOT NULL,
    page_id integer,
    section_name character varying(255) NOT NULL,
    section_type character varying(50) NOT NULL,
    section_header text,
    section_subheader text,
    background_color character varying(50),
    text_color character varying(50),
    display_order integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    custom_css text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_sections; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_sections IS 'Sections within pages (hero, content areas, etc.)';


--
-- Name: website_sections_section_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_sections_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_sections_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_sections_section_id_seq OWNED BY public.website_sections.section_id;


--
-- Name: website_theme_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.website_theme_settings (
    setting_id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    setting_type character varying(50) DEFAULT 'color'::character varying,
    category character varying(50) DEFAULT 'general'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE website_theme_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.website_theme_settings IS 'Stores theme customization settings like colors, fonts, and styles';


--
-- Name: website_theme_settings_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.website_theme_settings_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_theme_settings_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.website_theme_settings_setting_id_seq OWNED BY public.website_theme_settings.setting_id;


--
-- Name: age_ratings rating_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.age_ratings ALTER COLUMN rating_id SET DEFAULT nextval('public.age_ratings_rating_id_seq'::regclass);


--
-- Name: blog_comments comment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments ALTER COLUMN comment_id SET DEFAULT nextval('public.blog_comments_comment_id_seq'::regclass);


--
-- Name: blog_post_likes like_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes ALTER COLUMN like_id SET DEFAULT nextval('public.blog_post_likes_like_id_seq'::regclass);


--
-- Name: blog_posts post_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN post_id SET DEFAULT nextval('public.blog_posts_post_id_seq'::regclass);


--
-- Name: book_contributors book_contributor_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_contributors ALTER COLUMN book_contributor_id SET DEFAULT nextval('public.book_contributors_book_contributor_id_seq'::regclass);


--
-- Name: book_suggestions suggestion_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_suggestions ALTER COLUMN suggestion_id SET DEFAULT nextval('public.book_suggestions_suggestion_id_seq'::regclass);


--
-- Name: books book_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books ALTER COLUMN book_id SET DEFAULT nextval('public.books_book_id_seq'::regclass);


--
-- Name: borrowings borrowing_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings ALTER COLUMN borrowing_id SET DEFAULT nextval('public.borrowings_borrowing_id_seq'::regclass);


--
-- Name: collections collection_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections ALTER COLUMN collection_id SET DEFAULT nextval('public.collections_collection_id_seq'::regclass);


--
-- Name: content_moderation_log log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_moderation_log ALTER COLUMN log_id SET DEFAULT nextval('public.content_moderation_log_log_id_seq'::regclass);


--
-- Name: contributors contributor_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors ALTER COLUMN contributor_id SET DEFAULT nextval('public.contributors_contributor_id_seq'::regclass);


--
-- Name: cowork_bookings booking_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cowork_bookings ALTER COLUMN booking_id SET DEFAULT nextval('public.cowork_bookings_booking_id_seq'::regclass);


--
-- Name: cowork_subscriptions subscription_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cowork_subscriptions ALTER COLUMN subscription_id SET DEFAULT nextval('public.cowork_subscriptions_subscription_id_seq'::regclass);


--
-- Name: event_registrations registration_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations ALTER COLUMN registration_id SET DEFAULT nextval('public.event_registrations_registration_id_seq'::regclass);


--
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);


--
-- Name: invoice_line_items line_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items ALTER COLUMN line_item_id SET DEFAULT nextval('public.invoice_line_items_line_item_id_seq'::regclass);


--
-- Name: invoices invoice_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices ALTER COLUMN invoice_id SET DEFAULT nextval('public.invoices_invoice_id_seq'::regclass);


--
-- Name: items item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items ALTER COLUMN item_id SET DEFAULT nextval('public.items_item_id_seq'::regclass);


--
-- Name: membership_plans plan_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.membership_plans_plan_id_seq'::regclass);


--
-- Name: new_arrivals arrival_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_arrivals ALTER COLUMN arrival_id SET DEFAULT nextval('public.new_arrivals_arrival_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: reading_history history_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_history ALTER COLUMN history_id SET DEFAULT nextval('public.reading_history_history_id_seq'::regclass);


--
-- Name: recommendation_list_books id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_list_books ALTER COLUMN id SET DEFAULT nextval('public.recommendation_list_books_id_seq'::regclass);


--
-- Name: recommendation_lists list_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_lists ALTER COLUMN list_id SET DEFAULT nextval('public.recommendation_lists_list_id_seq'::regclass);


--
-- Name: reservations reservation_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations ALTER COLUMN reservation_id SET DEFAULT nextval('public.reservations_reservation_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: social_media_posts post_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_posts ALTER COLUMN post_id SET DEFAULT nextval('public.social_media_posts_post_id_seq'::regclass);


--
-- Name: testimonials testimonial_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN testimonial_id SET DEFAULT nextval('public.testimonials_testimonial_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: website_cards card_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_cards ALTER COLUMN card_id SET DEFAULT nextval('public.website_cards_card_id_seq'::regclass);


--
-- Name: website_content_blocks block_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_content_blocks ALTER COLUMN block_id SET DEFAULT nextval('public.website_content_blocks_block_id_seq'::regclass);


--
-- Name: website_global_settings setting_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_global_settings ALTER COLUMN setting_id SET DEFAULT nextval('public.website_global_settings_setting_id_seq'::regclass);


--
-- Name: website_media media_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_media ALTER COLUMN media_id SET DEFAULT nextval('public.website_media_media_id_seq'::regclass);


--
-- Name: website_menu_items menu_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_menu_items ALTER COLUMN menu_item_id SET DEFAULT nextval('public.website_menu_items_menu_item_id_seq'::regclass);


--
-- Name: website_pages page_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_pages ALTER COLUMN page_id SET DEFAULT nextval('public.website_pages_page_id_seq'::regclass);


--
-- Name: website_sections section_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_sections ALTER COLUMN section_id SET DEFAULT nextval('public.website_sections_section_id_seq'::regclass);


--
-- Name: website_theme_settings setting_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_theme_settings ALTER COLUMN setting_id SET DEFAULT nextval('public.website_theme_settings_setting_id_seq'::regclass);


--
-- Name: age_ratings age_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.age_ratings
    ADD CONSTRAINT age_ratings_pkey PRIMARY KEY (rating_id);


--
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (comment_id);


--
-- Name: blog_post_likes blog_post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_pkey PRIMARY KEY (like_id);


--
-- Name: blog_post_likes blog_post_likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (post_id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: book_contributors book_contributors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_contributors
    ADD CONSTRAINT book_contributors_pkey PRIMARY KEY (book_contributor_id);


--
-- Name: book_suggestions book_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_suggestions
    ADD CONSTRAINT book_suggestions_pkey PRIMARY KEY (suggestion_id);


--
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (book_id);


--
-- Name: borrowings borrowings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_pkey PRIMARY KEY (borrowing_id);


--
-- Name: collections collections_collection_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_collection_name_key UNIQUE (collection_name);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (collection_id);


--
-- Name: content_moderation_log content_moderation_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_moderation_log
    ADD CONSTRAINT content_moderation_log_pkey PRIMARY KEY (log_id);


--
-- Name: contributors contributors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_pkey PRIMARY KEY (contributor_id);


--
-- Name: cowork_bookings cowork_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cowork_bookings
    ADD CONSTRAINT cowork_bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: cowork_subscriptions cowork_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cowork_subscriptions
    ADD CONSTRAINT cowork_subscriptions_pkey PRIMARY KEY (subscription_id);


--
-- Name: event_registrations event_registrations_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (registration_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- Name: invoice_line_items invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_pkey PRIMARY KEY (line_item_id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- Name: items items_barcode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_barcode_key UNIQUE (barcode);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (item_id);


--
-- Name: membership_plans membership_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT membership_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: new_arrivals new_arrivals_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_arrivals
    ADD CONSTRAINT new_arrivals_book_id_key UNIQUE (book_id);


--
-- Name: new_arrivals new_arrivals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_arrivals
    ADD CONSTRAINT new_arrivals_pkey PRIMARY KEY (arrival_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: patrons patrons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_pkey PRIMARY KEY (patron_id);


--
-- Name: rda_carrier_types rda_carrier_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rda_carrier_types
    ADD CONSTRAINT rda_carrier_types_pkey PRIMARY KEY (code);


--
-- Name: rda_content_types rda_content_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rda_content_types
    ADD CONSTRAINT rda_content_types_pkey PRIMARY KEY (code);


--
-- Name: rda_media_types rda_media_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rda_media_types
    ADD CONSTRAINT rda_media_types_pkey PRIMARY KEY (code);


--
-- Name: reading_history reading_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_pkey PRIMARY KEY (history_id);


--
-- Name: recommendation_list_books recommendation_list_books_list_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_list_books
    ADD CONSTRAINT recommendation_list_books_list_id_book_id_key UNIQUE (list_id, book_id);


--
-- Name: recommendation_list_books recommendation_list_books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_list_books
    ADD CONSTRAINT recommendation_list_books_pkey PRIMARY KEY (id);


--
-- Name: recommendation_lists recommendation_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_lists
    ADD CONSTRAINT recommendation_lists_pkey PRIMARY KEY (list_id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: reviews reviews_patron_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_patron_id_book_id_key UNIQUE (patron_id, book_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: social_media_posts social_media_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_posts
    ADD CONSTRAINT social_media_posts_pkey PRIMARY KEY (post_id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (testimonial_id);


--
-- Name: book_contributors unique_book_contributor_role; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_contributors
    ADD CONSTRAINT unique_book_contributor_role UNIQUE (book_id, contributor_id, role);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: website_cards website_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_cards
    ADD CONSTRAINT website_cards_pkey PRIMARY KEY (card_id);


--
-- Name: website_content_blocks website_content_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_content_blocks
    ADD CONSTRAINT website_content_blocks_pkey PRIMARY KEY (block_id);


--
-- Name: website_global_settings website_global_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_global_settings
    ADD CONSTRAINT website_global_settings_pkey PRIMARY KEY (setting_id);


--
-- Name: website_media website_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_media
    ADD CONSTRAINT website_media_pkey PRIMARY KEY (media_id);


--
-- Name: website_menu_items website_menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_menu_items
    ADD CONSTRAINT website_menu_items_pkey PRIMARY KEY (menu_item_id);


--
-- Name: website_pages website_pages_page_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_pages
    ADD CONSTRAINT website_pages_page_slug_key UNIQUE (page_slug);


--
-- Name: website_pages website_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_pages
    ADD CONSTRAINT website_pages_pkey PRIMARY KEY (page_id);


--
-- Name: website_sections website_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_sections
    ADD CONSTRAINT website_sections_pkey PRIMARY KEY (section_id);


--
-- Name: website_theme_settings website_theme_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_theme_settings
    ADD CONSTRAINT website_theme_settings_pkey PRIMARY KEY (setting_id);


--
-- Name: website_theme_settings website_theme_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_theme_settings
    ADD CONSTRAINT website_theme_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: idx_blog_comments_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comments_post ON public.blog_comments USING btree (post_id);


--
-- Name: idx_blog_comments_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comments_user ON public.blog_comments USING btree (user_id);


--
-- Name: idx_blog_likes_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_likes_post ON public.blog_post_likes USING btree (post_id);


--
-- Name: idx_blog_posts_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_author ON public.blog_posts USING btree (author_id);


--
-- Name: idx_blog_posts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_category ON public.blog_posts USING btree (category);


--
-- Name: idx_blog_posts_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_published ON public.blog_posts USING btree (published_at DESC);


--
-- Name: idx_blog_posts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_status ON public.blog_posts USING btree (status);


--
-- Name: idx_blog_posts_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING gin (tags);


--
-- Name: idx_book_contributors_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_contributors_book_id ON public.book_contributors USING btree (book_id);


--
-- Name: idx_book_contributors_contributor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_contributors_contributor_id ON public.book_contributors USING btree (contributor_id);


--
-- Name: idx_book_contributors_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_contributors_role ON public.book_contributors USING btree (role);


--
-- Name: idx_book_suggestions_patron; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_suggestions_patron ON public.book_suggestions USING btree (patron_id);


--
-- Name: idx_book_suggestions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_suggestions_status ON public.book_suggestions USING btree (status);


--
-- Name: idx_books_call_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_call_number ON public.books USING btree (call_number);


--
-- Name: idx_books_carrier_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_carrier_type ON public.books USING btree (carrier_type);


--
-- Name: idx_books_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_collection_id ON public.books USING btree (collection_id);


--
-- Name: idx_books_content_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_content_type ON public.books USING btree (content_type);


--
-- Name: idx_books_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_is_active ON public.books USING btree (is_active);


--
-- Name: idx_books_isbn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_isbn ON public.books USING btree (isbn);


--
-- Name: idx_books_language; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_language ON public.books USING btree (language);


--
-- Name: idx_books_media_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_media_type ON public.books USING btree (media_type);


--
-- Name: idx_books_resource_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_resource_type ON public.books USING btree (resource_type);


--
-- Name: idx_books_subjects; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_subjects ON public.books USING gin (subjects);


--
-- Name: idx_books_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_title ON public.books USING btree (title);


--
-- Name: idx_borrowings_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_borrowings_due_date ON public.borrowings USING btree (due_date);


--
-- Name: idx_borrowings_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_borrowings_item_id ON public.borrowings USING btree (item_id);


--
-- Name: idx_borrowings_patron_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_borrowings_patron_id ON public.borrowings USING btree (patron_id);


--
-- Name: idx_borrowings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_borrowings_status ON public.borrowings USING btree (status);


--
-- Name: idx_contributors_authority_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributors_authority_id ON public.contributors USING btree (authority_id);


--
-- Name: idx_contributors_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributors_name ON public.contributors USING btree (name);


--
-- Name: idx_contributors_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributors_type ON public.contributors USING btree (name_type);


--
-- Name: idx_event_registrations_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_registrations_event ON public.event_registrations USING btree (event_id);


--
-- Name: idx_event_registrations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_registrations_user ON public.event_registrations USING btree (user_id);


--
-- Name: idx_events_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_category ON public.events USING btree (category);


--
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date DESC);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- Name: idx_invoice_line_items_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items USING btree (invoice_id);


--
-- Name: idx_invoices_patron_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_patron_id ON public.invoices USING btree (patron_id);


--
-- Name: idx_items_barcode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_barcode ON public.items USING btree (barcode);


--
-- Name: idx_items_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_book_id ON public.items USING btree (book_id);


--
-- Name: idx_items_circulation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_circulation_status ON public.items USING btree (circulation_status);


--
-- Name: idx_items_shelf_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_shelf_location ON public.items USING btree (shelf_location);


--
-- Name: idx_moderation_log_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_log_content ON public.content_moderation_log USING btree (content_type, content_id);


--
-- Name: idx_moderation_log_moderator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_moderation_log_moderator ON public.content_moderation_log USING btree (moderator_id);


--
-- Name: idx_mv_book_availability_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_mv_book_availability_book_id ON public.mv_book_availability USING btree (book_id);


--
-- Name: idx_mv_book_availability_isbn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mv_book_availability_isbn ON public.mv_book_availability USING btree (isbn);


--
-- Name: idx_new_arrivals_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_new_arrivals_date ON public.new_arrivals USING btree (added_date DESC);


--
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_patrons_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patrons_tags ON public.patrons USING gin (to_tsvector('english'::regconfig, tags));


--
-- Name: idx_reservations_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_book_id ON public.reservations USING btree (book_id);


--
-- Name: idx_reservations_patron_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_patron_id ON public.reservations USING btree (patron_id);


--
-- Name: idx_reservations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reservations_status ON public.reservations USING btree (status);


--
-- Name: idx_reviews_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_book_id ON public.reviews USING btree (book_id);


--
-- Name: idx_reviews_patron_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_patron_id ON public.reviews USING btree (patron_id);


--
-- Name: idx_testimonials_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_testimonials_featured ON public.testimonials USING btree (is_featured);


--
-- Name: idx_testimonials_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_testimonials_status ON public.testimonials USING btree (status);


--
-- Name: idx_website_cards_section; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_cards_section ON public.website_cards USING btree (section_id);


--
-- Name: idx_website_content_blocks_section; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_content_blocks_section ON public.website_content_blocks USING btree (section_id);


--
-- Name: idx_website_media_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_media_type ON public.website_media USING btree (media_type);


--
-- Name: idx_website_menu_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_menu_location ON public.website_menu_items USING btree (menu_location);


--
-- Name: idx_website_menu_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_menu_parent ON public.website_menu_items USING btree (parent_id);


--
-- Name: idx_website_pages_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_pages_published ON public.website_pages USING btree (is_published);


--
-- Name: idx_website_pages_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_pages_slug ON public.website_pages USING btree (page_slug);


--
-- Name: idx_website_sections_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_sections_order ON public.website_sections USING btree (display_order);


--
-- Name: idx_website_sections_page; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_website_sections_page ON public.website_sections USING btree (page_id);


--
-- Name: blog_post_stats _RETURN; Type: RULE; Schema: public; Owner: -
--

CREATE OR REPLACE VIEW public.blog_post_stats AS
 SELECT bp.post_id,
    bp.title,
    bp.author_id,
    u.email AS author_email,
    (((p.first_name)::text || ' '::text) || (p.last_name)::text) AS author_name,
    bp.status,
    bp.view_count,
    count(DISTINCT bc.comment_id) AS comment_count,
    count(DISTINCT bpl.like_id) AS like_count,
    bp.published_at,
    bp.created_at
   FROM ((((public.blog_posts bp
     LEFT JOIN public.users u ON ((bp.author_id = u.user_id)))
     LEFT JOIN public.patrons p ON ((u.user_id = p.user_id)))
     LEFT JOIN public.blog_comments bc ON ((bp.post_id = bc.post_id)))
     LEFT JOIN public.blog_post_likes bpl ON ((bp.post_id = bpl.post_id)))
  GROUP BY bp.post_id, u.email, p.first_name, p.last_name;


--
-- Name: blog_posts blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();


--
-- Name: event_registrations event_participant_counter; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER event_participant_counter AFTER INSERT OR DELETE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION public.update_event_participant_count();


--
-- Name: events events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();


--
-- Name: recommendation_lists recommendation_lists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER recommendation_lists_updated_at BEFORE UPDATE ON public.recommendation_lists FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();


--
-- Name: borrowings sync_item_status_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_item_status_trigger AFTER INSERT OR UPDATE ON public.borrowings FOR EACH ROW EXECUTE FUNCTION public.sync_item_circulation_status();


--
-- Name: books update_books_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: borrowings update_borrowings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_borrowings_updated_at BEFORE UPDATE ON public.borrowings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: collections update_collections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contributors update_contributors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contributors_updated_at BEFORE UPDATE ON public.contributors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: items update_item_status_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_item_status_trigger BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_item_status_changed_at();


--
-- Name: items update_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: membership_plans update_membership_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: patrons update_patrons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_patrons_updated_at BEFORE UPDATE ON public.patrons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_cards update_website_cards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_cards_updated_at BEFORE UPDATE ON public.website_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_content_blocks update_website_content_blocks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_content_blocks_updated_at BEFORE UPDATE ON public.website_content_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_global_settings update_website_global_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_global_settings_updated_at BEFORE UPDATE ON public.website_global_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_media update_website_media_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_media_updated_at BEFORE UPDATE ON public.website_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_menu_items update_website_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_menu_items_updated_at BEFORE UPDATE ON public.website_menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_pages update_website_pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_pages_updated_at BEFORE UPDATE ON public.website_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_sections update_website_sections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_sections_updated_at BEFORE UPDATE ON public.website_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: website_theme_settings update_website_theme_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_website_theme_settings_updated_at BEFORE UPDATE ON public.website_theme_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: blog_comments blog_comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.blog_comments(comment_id) ON DELETE CASCADE;


--
-- Name: blog_comments blog_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(post_id) ON DELETE CASCADE;


--
-- Name: blog_comments blog_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: blog_post_likes blog_post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(post_id) ON DELETE CASCADE;


--
-- Name: blog_post_likes blog_post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(user_id);


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: book_contributors book_contributors_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_contributors
    ADD CONSTRAINT book_contributors_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: book_contributors book_contributors_contributor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_contributors
    ADD CONSTRAINT book_contributors_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.contributors(contributor_id) ON DELETE CASCADE;


--
-- Name: book_suggestions book_suggestions_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_suggestions
    ADD CONSTRAINT book_suggestions_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: book_suggestions book_suggestions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_suggestions
    ADD CONSTRAINT book_suggestions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(user_id);


--
-- Name: books books_carrier_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_carrier_type_fkey FOREIGN KEY (carrier_type) REFERENCES public.rda_carrier_types(code);


--
-- Name: books books_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(collection_id);


--
-- Name: books books_content_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_content_type_fkey FOREIGN KEY (content_type) REFERENCES public.rda_content_types(code);


--
-- Name: books books_media_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_media_type_fkey FOREIGN KEY (media_type) REFERENCES public.rda_media_types(code);


--
-- Name: borrowings borrowings_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: borrowings borrowings_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: content_moderation_log content_moderation_log_moderator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_moderation_log
    ADD CONSTRAINT content_moderation_log_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES public.users(user_id);


--
-- Name: cowork_bookings cowork_bookings_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cowork_bookings
    ADD CONSTRAINT cowork_bookings_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: cowork_subscriptions cowork_subscriptions_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cowork_subscriptions
    ADD CONSTRAINT cowork_subscriptions_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: event_registrations event_registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- Name: event_registrations event_registrations_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE SET NULL;


--
-- Name: event_registrations event_registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: invoice_line_items invoice_line_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id) ON DELETE CASCADE;


--
-- Name: invoices invoices_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: items items_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: new_arrivals new_arrivals_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_arrivals
    ADD CONSTRAINT new_arrivals_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(user_id);


--
-- Name: new_arrivals new_arrivals_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_arrivals
    ADD CONSTRAINT new_arrivals_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: patrons patrons_membership_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_membership_plan_id_fkey FOREIGN KEY (membership_plan_id) REFERENCES public.membership_plans(plan_id);


--
-- Name: patrons patrons_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: rda_carrier_types rda_carrier_types_media_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rda_carrier_types
    ADD CONSTRAINT rda_carrier_types_media_type_code_fkey FOREIGN KEY (media_type_code) REFERENCES public.rda_media_types(code);


--
-- Name: reading_history reading_history_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: recommendation_list_books recommendation_list_books_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_list_books
    ADD CONSTRAINT recommendation_list_books_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: recommendation_list_books recommendation_list_books_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_list_books
    ADD CONSTRAINT recommendation_list_books_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.recommendation_lists(list_id) ON DELETE CASCADE;


--
-- Name: recommendation_lists recommendation_lists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_lists
    ADD CONSTRAINT recommendation_lists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: reservations reservations_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id);


--
-- Name: reservations reservations_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id);


--
-- Name: reviews reviews_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: testimonials testimonials_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(user_id);


--
-- Name: testimonials testimonials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: website_cards website_cards_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_cards
    ADD CONSTRAINT website_cards_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.website_sections(section_id) ON DELETE CASCADE;


--
-- Name: website_content_blocks website_content_blocks_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_content_blocks
    ADD CONSTRAINT website_content_blocks_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.website_sections(section_id) ON DELETE CASCADE;


--
-- Name: website_media website_media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_media
    ADD CONSTRAINT website_media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: website_menu_items website_menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_menu_items
    ADD CONSTRAINT website_menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.website_menu_items(menu_item_id) ON DELETE CASCADE;


--
-- Name: website_pages website_pages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_pages
    ADD CONSTRAINT website_pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: website_sections website_sections_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.website_sections
    ADD CONSTRAINT website_sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.website_pages(page_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict TFexwwKq85hDPOVlMNALA5zEVjD5PSPDnjyaZMVvuQMO6AELAMmHsi9x1XLKY08

