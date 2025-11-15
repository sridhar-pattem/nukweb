--
-- PostgreSQL database dump
--

\restrict UomYNaVUx9iLHnfatik8jeTClwv0jZfTbVhYPRcP6IEBl1zI7f1BxsFWAsiqjMZ

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
-- Name: update_book_availability(); Type: FUNCTION; Schema: public; Owner: sridharpattem
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


ALTER FUNCTION public.update_book_availability() OWNER TO sridharpattem;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: sridharpattem
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO sridharpattem;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: age_ratings; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.age_ratings (
    rating_id integer NOT NULL,
    rating_name character varying(50) NOT NULL,
    min_age integer NOT NULL,
    max_age integer,
    description text
);


ALTER TABLE public.age_ratings OWNER TO sridharpattem;

--
-- Name: age_ratings_rating_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.age_ratings_rating_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.age_ratings_rating_id_seq OWNER TO sridharpattem;

--
-- Name: age_ratings_rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.age_ratings_rating_id_seq OWNED BY public.age_ratings.rating_id;


--
-- Name: books; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.books (
    book_id integer NOT NULL,
    isbn character varying(13) NOT NULL,
    title character varying(500) NOT NULL,
    author character varying(255),
    genre character varying(100),
    sub_genre character varying(100),
    publisher character varying(255),
    publication_year integer,
    description text,
    collection character varying(100),
    total_copies integer DEFAULT 1,
    available_copies integer DEFAULT 1,
    age_rating character varying(50),
    cover_image_url text,
    status character varying(20) DEFAULT 'Available'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT books_status_check CHECK (((status)::text = ANY ((ARRAY['Available'::character varying, 'Lost'::character varying, 'Damaged'::character varying, 'Phased Out'::character varying])::text[])))
);


ALTER TABLE public.books OWNER TO sridharpattem;

--
-- Name: books_book_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.books_book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.books_book_id_seq OWNER TO sridharpattem;

--
-- Name: books_book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.books_book_id_seq OWNED BY public.books.book_id;


--
-- Name: borrowings; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.borrowings (
    borrowing_id integer NOT NULL,
    patron_id integer,
    book_id integer,
    checkout_date date DEFAULT CURRENT_DATE NOT NULL,
    due_date date NOT NULL,
    return_date date,
    renewal_count integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT borrowings_renewal_count_check CHECK ((renewal_count <= 2)),
    CONSTRAINT borrowings_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'returned'::character varying, 'overdue'::character varying])::text[])))
);


ALTER TABLE public.borrowings OWNER TO sridharpattem;

--
-- Name: borrowings_borrowing_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.borrowings_borrowing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.borrowings_borrowing_id_seq OWNER TO sridharpattem;

--
-- Name: borrowings_borrowing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.borrowings_borrowing_id_seq OWNED BY public.borrowings.borrowing_id;


--
-- Name: cowork_bookings; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.cowork_bookings (
    booking_id integer NOT NULL,
    patron_id integer,
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


ALTER TABLE public.cowork_bookings OWNER TO sridharpattem;

--
-- Name: cowork_bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.cowork_bookings_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cowork_bookings_booking_id_seq OWNER TO sridharpattem;

--
-- Name: cowork_bookings_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.cowork_bookings_booking_id_seq OWNED BY public.cowork_bookings.booking_id;


--
-- Name: cowork_subscriptions; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.cowork_subscriptions (
    subscription_id integer NOT NULL,
    patron_id integer,
    subscription_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    price numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cowork_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT cowork_subscriptions_subscription_type_check CHECK (((subscription_type)::text = ANY ((ARRAY['full-day'::character varying, 'half-day'::character varying, 'weekend-only'::character varying])::text[])))
);


ALTER TABLE public.cowork_subscriptions OWNER TO sridharpattem;

--
-- Name: cowork_subscriptions_subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.cowork_subscriptions_subscription_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cowork_subscriptions_subscription_id_seq OWNER TO sridharpattem;

--
-- Name: cowork_subscriptions_subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.cowork_subscriptions_subscription_id_seq OWNED BY public.cowork_subscriptions.subscription_id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.invoices (
    invoice_id integer NOT NULL,
    patron_id integer,
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
    CONSTRAINT invoices_invoice_type_check CHECK (((invoice_type)::text = ANY ((ARRAY['membership'::character varying, 'cowork'::character varying])::text[]))),
    CONSTRAINT invoices_payment_mode_check CHECK (((payment_mode)::text = ANY ((ARRAY['UPI'::character varying, 'Cash'::character varying, 'Credit/Debit Card'::character varying, 'Bank Transfer'::character varying, 'Gift Coupon'::character varying])::text[]))),
    CONSTRAINT invoices_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'overdue'::character varying])::text[])))
);


ALTER TABLE public.invoices OWNER TO sridharpattem;

--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.invoices_invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoices_invoice_id_seq OWNER TO sridharpattem;

--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.invoices_invoice_id_seq OWNED BY public.invoices.invoice_id;


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.membership_plans (
    plan_id integer NOT NULL,
    plan_name character varying(100) NOT NULL,
    plan_type character varying(50) NOT NULL,
    duration_days integer NOT NULL,
    price numeric(10,2) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT membership_plans_plan_type_check CHECK (((plan_type)::text = ANY ((ARRAY['Active'::character varying, 'Renewal Due'::character varying, 'Freeze'::character varying, 'Closed'::character varying])::text[])))
);


ALTER TABLE public.membership_plans OWNER TO sridharpattem;

--
-- Name: membership_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.membership_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.membership_plans_plan_id_seq OWNER TO sridharpattem;

--
-- Name: membership_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.membership_plans_plan_id_seq OWNED BY public.membership_plans.plan_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: sridharpattem
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


ALTER TABLE public.notifications OWNER TO sridharpattem;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_notification_id_seq OWNER TO sridharpattem;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: patrons; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.patrons (
    patron_id integer NOT NULL,
    user_id integer,
    membership_plan_id integer,
    membership_type character varying(50),
    membership_start_date date,
    membership_expiry_date date,
    address text,
    join_date date DEFAULT CURRENT_DATE,
    mobile_number character varying(20)
);


ALTER TABLE public.patrons OWNER TO sridharpattem;

--
-- Name: patrons_patron_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.patrons_patron_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.patrons_patron_id_seq OWNER TO sridharpattem;

--
-- Name: patrons_patron_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.patrons_patron_id_seq OWNED BY public.patrons.patron_id;


--
-- Name: reading_history; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.reading_history (
    history_id integer NOT NULL,
    patron_id integer,
    book_id integer,
    read_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reading_history OWNER TO sridharpattem;

--
-- Name: reading_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.reading_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reading_history_history_id_seq OWNER TO sridharpattem;

--
-- Name: reading_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.reading_history_history_id_seq OWNED BY public.reading_history.history_id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.reservations (
    reservation_id integer NOT NULL,
    patron_id integer,
    book_id integer,
    reservation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expiry_date timestamp without time zone,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reservations_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'fulfilled'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.reservations OWNER TO sridharpattem;

--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.reservations_reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reservations_reservation_id_seq OWNER TO sridharpattem;

--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.reservations_reservation_id_seq OWNED BY public.reservations.reservation_id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    patron_id integer,
    book_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO sridharpattem;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_review_id_seq OWNER TO sridharpattem;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: social_media_posts; Type: TABLE; Schema: public; Owner: sridharpattem
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


ALTER TABLE public.social_media_posts OWNER TO sridharpattem;

--
-- Name: social_media_posts_post_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.social_media_posts_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.social_media_posts_post_id_seq OWNER TO sridharpattem;

--
-- Name: social_media_posts_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.social_media_posts_post_id_seq OWNED BY public.social_media_posts.post_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sridharpattem
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'patron'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'frozen'::character varying, 'closed'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO sridharpattem;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: sridharpattem
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO sridharpattem;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sridharpattem
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: age_ratings rating_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.age_ratings ALTER COLUMN rating_id SET DEFAULT nextval('public.age_ratings_rating_id_seq'::regclass);


--
-- Name: books book_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.books ALTER COLUMN book_id SET DEFAULT nextval('public.books_book_id_seq'::regclass);


--
-- Name: borrowings borrowing_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.borrowings ALTER COLUMN borrowing_id SET DEFAULT nextval('public.borrowings_borrowing_id_seq'::regclass);


--
-- Name: cowork_bookings booking_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.cowork_bookings ALTER COLUMN booking_id SET DEFAULT nextval('public.cowork_bookings_booking_id_seq'::regclass);


--
-- Name: cowork_subscriptions subscription_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.cowork_subscriptions ALTER COLUMN subscription_id SET DEFAULT nextval('public.cowork_subscriptions_subscription_id_seq'::regclass);


--
-- Name: invoices invoice_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.invoices ALTER COLUMN invoice_id SET DEFAULT nextval('public.invoices_invoice_id_seq'::regclass);


--
-- Name: membership_plans plan_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.membership_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.membership_plans_plan_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: patrons patron_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.patrons ALTER COLUMN patron_id SET DEFAULT nextval('public.patrons_patron_id_seq'::regclass);


--
-- Name: reading_history history_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reading_history ALTER COLUMN history_id SET DEFAULT nextval('public.reading_history_history_id_seq'::regclass);


--
-- Name: reservations reservation_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reservations ALTER COLUMN reservation_id SET DEFAULT nextval('public.reservations_reservation_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: social_media_posts post_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.social_media_posts ALTER COLUMN post_id SET DEFAULT nextval('public.social_media_posts_post_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: age_ratings; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.age_ratings (rating_id, rating_name, min_age, max_age, description) FROM stdin;
1	2-4 years	2	4	Toddlers and preschoolers
2	5-6 years	5	6	Early readers
3	7-9 years	7	9	Young readers
4	10+ years	10	\N	Pre-teens and older
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.books (book_id, isbn, title, author, genre, sub_genre, publisher, publication_year, description, collection, total_copies, available_copies, age_rating, cover_image_url, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: borrowings; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.borrowings (borrowing_id, patron_id, book_id, checkout_date, due_date, return_date, renewal_count, status, created_at) FROM stdin;
\.


--
-- Data for Name: cowork_bookings; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.cowork_bookings (booking_id, patron_id, booking_date, time_slot, booking_type, desk_number, status, request_message, created_at) FROM stdin;
\.


--
-- Data for Name: cowork_subscriptions; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.cowork_subscriptions (subscription_id, patron_id, subscription_type, start_date, end_date, price, status, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.invoices (invoice_id, patron_id, invoice_number, invoice_type, amount, payment_mode, payment_status, issue_date, due_date, payment_date, pdf_url, sent_via_email, created_at) FROM stdin;
\.


--
-- Data for Name: membership_plans; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.membership_plans (plan_id, plan_name, plan_type, duration_days, price, description, created_at) FROM stdin;
6	1-Book Plan	Active	90	1000.00		2025-11-16 01:55:53.329204
7	2-Book Plan	Active	90	1300.00		2025-11-16 01:56:32.879989
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.notifications (notification_id, user_id, notification_type, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: patrons; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.patrons (patron_id, user_id, membership_plan_id, membership_type, membership_start_date, membership_expiry_date, address, join_date, mobile_number) FROM stdin;
1	3	7	2-Book Plan	2025-11-16	2026-02-14	Viva 105, SJR Verity Apts, Kasavanahalli	2025-11-16	7259528336
\.


--
-- Data for Name: reading_history; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.reading_history (history_id, patron_id, book_id, read_date, created_at) FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.reservations (reservation_id, patron_id, book_id, reservation_date, expiry_date, status, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.reviews (review_id, patron_id, book_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: social_media_posts; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.social_media_posts (post_id, platform, post_content, post_url, image_url, published_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sridharpattem
--

COPY public.users (user_id, email, password_hash, role, name, phone, status, created_at, updated_at) FROM stdin;
1	admin@nuklibrary.com	$2b$12$.eraVZ3CTwtvsw9GcaYSVO9ZR2NbbkFF7PN2sFPz0JK2.XAAIJz4a	admin	Admin User	9999999999	active	2025-11-15 04:01:10.750311	2025-11-15 04:57:27.47351
2	sridhar@xyz.com	$2b$12$VKgf0j5k3sBc/kMRPCWePe9XQhAtLqSeawIytNLwVxzuJFT7RYKyW	patron	Sridhar Pattem		active	2025-11-15 10:51:08.370163	2025-11-15 10:51:08.370163
3	sridhar@mail.com	$2b$12$HilKrp8w2cL4g7g.2RqufeYVLmshxVzVYgLvckH4zaJvoPGH1FYim	patron	Sridhar Pattem		active	2025-11-16 01:57:04.583162	2025-11-16 01:57:04.583162
\.


--
-- Name: age_ratings_rating_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.age_ratings_rating_id_seq', 4, true);


--
-- Name: books_book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.books_book_id_seq', 1, false);


--
-- Name: borrowings_borrowing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.borrowings_borrowing_id_seq', 1, false);


--
-- Name: cowork_bookings_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.cowork_bookings_booking_id_seq', 1, false);


--
-- Name: cowork_subscriptions_subscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.cowork_subscriptions_subscription_id_seq', 1, false);


--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.invoices_invoice_id_seq', 1, false);


--
-- Name: membership_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.membership_plans_plan_id_seq', 7, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- Name: patrons_patron_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.patrons_patron_id_seq', 1, true);


--
-- Name: reading_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.reading_history_history_id_seq', 1, false);


--
-- Name: reservations_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.reservations_reservation_id_seq', 1, false);


--
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- Name: social_media_posts_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.social_media_posts_post_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sridharpattem
--

SELECT pg_catalog.setval('public.users_user_id_seq', 3, true);


--
-- Name: age_ratings age_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.age_ratings
    ADD CONSTRAINT age_ratings_pkey PRIMARY KEY (rating_id);


--
-- Name: age_ratings age_ratings_rating_name_key; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.age_ratings
    ADD CONSTRAINT age_ratings_rating_name_key UNIQUE (rating_name);


--
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (book_id);


--
-- Name: borrowings borrowings_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_pkey PRIMARY KEY (borrowing_id);


--
-- Name: cowork_bookings cowork_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.cowork_bookings
    ADD CONSTRAINT cowork_bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: cowork_subscriptions cowork_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.cowork_subscriptions
    ADD CONSTRAINT cowork_subscriptions_pkey PRIMARY KEY (subscription_id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- Name: membership_plans membership_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT membership_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: patrons patrons_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_pkey PRIMARY KEY (patron_id);


--
-- Name: patrons patrons_user_id_key; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_user_id_key UNIQUE (user_id);


--
-- Name: reading_history reading_history_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_pkey PRIMARY KEY (history_id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (reservation_id);


--
-- Name: reviews reviews_patron_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_patron_id_book_id_key UNIQUE (patron_id, book_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: social_media_posts social_media_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.social_media_posts
    ADD CONSTRAINT social_media_posts_pkey PRIMARY KEY (post_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_books_collection; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_books_collection ON public.books USING btree (collection);


--
-- Name: idx_books_genre; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_books_genre ON public.books USING btree (genre);


--
-- Name: idx_books_isbn; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_books_isbn ON public.books USING btree (isbn);


--
-- Name: idx_borrowings_book_id; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_borrowings_book_id ON public.borrowings USING btree (book_id);


--
-- Name: idx_borrowings_due_date; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_borrowings_due_date ON public.borrowings USING btree (due_date);


--
-- Name: idx_borrowings_patron_id; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_borrowings_patron_id ON public.borrowings USING btree (patron_id);


--
-- Name: idx_borrowings_status; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_borrowings_status ON public.borrowings USING btree (status);


--
-- Name: idx_invoices_patron_id; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_invoices_patron_id ON public.invoices USING btree (patron_id);


--
-- Name: idx_patrons_user_id; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_patrons_user_id ON public.patrons USING btree (user_id);


--
-- Name: idx_reviews_book_id; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_reviews_book_id ON public.reviews USING btree (book_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: sridharpattem
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: borrowings update_book_availability_trigger; Type: TRIGGER; Schema: public; Owner: sridharpattem
--

CREATE TRIGGER update_book_availability_trigger AFTER INSERT OR UPDATE ON public.borrowings FOR EACH ROW EXECUTE FUNCTION public.update_book_availability();


--
-- Name: books update_books_updated_at; Type: TRIGGER; Schema: public; Owner: sridharpattem
--

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: sridharpattem
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: borrowings borrowings_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: borrowings borrowings_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: cowork_bookings cowork_bookings_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.cowork_bookings
    ADD CONSTRAINT cowork_bookings_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: cowork_subscriptions cowork_subscriptions_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.cowork_subscriptions
    ADD CONSTRAINT cowork_subscriptions_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: invoices invoices_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: patrons patrons_membership_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_membership_plan_id_fkey FOREIGN KEY (membership_plan_id) REFERENCES public.membership_plans(plan_id);


--
-- Name: patrons patrons_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: reading_history reading_history_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: reading_history reading_history_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: reservations reservations_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: reservations reservations_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(book_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_patron_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sridharpattem
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_patron_id_fkey FOREIGN KEY (patron_id) REFERENCES public.patrons(patron_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict UomYNaVUx9iLHnfatik8jeTClwv0jZfTbVhYPRcP6IEBl1zI7f1BxsFWAsiqjMZ

