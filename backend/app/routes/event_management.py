"""
Event Management Routes
Handles event creation, registration, and management
"""

from flask import Blueprint, request, jsonify
from app.utils.database import get_db_connection
from app.utils.auth import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import re

event_bp = Blueprint('events', __name__)

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

# =====================================================
# PUBLIC EVENT ROUTES
# =====================================================

@event_bp.route('/', methods=['GET'])
def get_events():
    """Get all published events"""
    category = request.args.get('category')
    upcoming_only = request.args.get('upcoming_only', 'true').lower() == 'true'

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
            SELECT
                event_id, title, slug, description, category,
                event_date, start_time, end_time, location,
                max_participants, current_participants, featured_image_url,
                fee, registration_enabled, registration_deadline
            FROM events
            WHERE status = 'published'
        """
        params = []

        if upcoming_only:
            query += " AND event_date >= CURRENT_DATE"

        if category:
            query += " AND category = %s"
            params.append(category)

        query += " ORDER BY event_date ASC, start_time ASC"

        cursor.execute(query, params)
        events = cursor.fetchall()

        events_list = []
        for event in events:
            events_list.append({
                'event_id': event[0],
                'title': event[1],
                'slug': event[2],
                'description': event[3],
                'category': event[4],
                'event_date': event[5].isoformat() if event[5] else None,
                'start_time': str(event[6]) if event[6] else None,
                'end_time': str(event[7]) if event[7] else None,
                'event_time': f"{event[6]} - {event[7]}" if event[6] and event[7] else None,
                'location': event[8],
                'max_participants': event[9],
                'current_participants': event[10],
                'featured_image_url': event[11],
                'fee': float(event[12]) if event[12] else 0,
                'registration_enabled': event[13],
                'registration_deadline': event[14].isoformat() if event[14] else None,
                'is_full': event[10] >= event[9] if event[9] else False
            })

        return jsonify({
            'events': events_list,
            'total': len(events_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@event_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get event details"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                event_id, title, slug, description, category,
                event_date, start_time, end_time, location,
                max_participants, current_participants, featured_image_url,
                fee, registration_enabled, registration_deadline,
                send_confirmation_email, status
            FROM events
            WHERE event_id = %s AND status = 'published'
        """, (event_id,))

        event = cursor.fetchone()

        if not event:
            return jsonify({'error': 'Event not found'}), 404

        return jsonify({
            'event_id': event[0],
            'title': event[1],
            'slug': event[2],
            'description': event[3],
            'category': event[4],
            'event_date': event[5].isoformat() if event[5] else None,
            'start_time': str(event[6]) if event[6] else None,
            'end_time': str(event[7]) if event[7] else None,
            'event_time': f"{event[6]} - {event[7]}" if event[6] and event[7] else None,
            'location': event[8],
            'max_participants': event[9],
            'current_participants': event[10],
            'featured_image_url': event[11],
            'fee': float(event[12]) if event[12] else 0,
            'registration_enabled': event[13],
            'registration_deadline': event[14].isoformat() if event[14] else None,
            'send_confirmation_email': event[15],
            'status': event[16],
            'is_full': event[10] >= event[9] if event[9] else False
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# =====================================================
# EVENT REGISTRATION
# =====================================================

@event_bp.route('/<int:event_id>/register', methods=['POST'])
@jwt_required(optional=True)
def register_for_event(event_id):
    """Register for an event"""
    data = request.json
    current_user_id = get_jwt_identity()

    # Validate required fields
    required_fields = ['attendee_name', 'attendee_email']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if event exists and is open for registration
        cursor.execute("""
            SELECT
                registration_enabled, max_participants, current_participants,
                registration_deadline, event_date, title
            FROM events
            WHERE event_id = %s AND status = 'published'
        """, (event_id,))

        event = cursor.fetchone()

        if not event:
            return jsonify({'error': 'Event not found'}), 404

        if not event[0]:
            return jsonify({'error': 'Registration is not enabled for this event'}), 400

        if event[1] and event[2] >= event[1]:
            return jsonify({'error': 'Event is full'}), 400

        if event[3] and datetime.now() > event[3]:
            return jsonify({'error': 'Registration deadline has passed'}), 400

        if event[4] and event[4] < datetime.now().date():
            return jsonify({'error': 'Event has already occurred'}), 400

        # Get patron_id if user is logged in
        patron_id = None
        if current_user_id:
            cursor.execute("""
                SELECT patron_id FROM patrons WHERE user_id = %s
            """, (current_user_id,))
            patron_result = cursor.fetchone()
            if patron_result:
                patron_id = patron_result[0]

            # Check if already registered
            cursor.execute("""
                SELECT registration_id FROM event_registrations
                WHERE event_id = %s AND user_id = %s
            """, (event_id, current_user_id))

            if cursor.fetchone():
                return jsonify({'error': 'You are already registered for this event'}), 400

        # Register for event
        cursor.execute("""
            INSERT INTO event_registrations (
                event_id, user_id, patron_id, attendee_name,
                attendee_email, attendee_phone, status, payment_status
            ) VALUES (%s, %s, %s, %s, %s, %s, 'confirmed', 'pending')
            RETURNING registration_id
        """, (
            event_id,
            current_user_id,
            patron_id,
            data['attendee_name'],
            data['attendee_email'],
            data.get('attendee_phone')
        ))

        registration_id = cursor.fetchone()[0]
        conn.commit()

        return jsonify({
            'message': 'Registration successful',
            'registration_id': registration_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@event_bp.route('/registrations/my', methods=['GET'])
@jwt_required()
def get_my_registrations():
    """Get user's event registrations"""
    current_user_id = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                er.registration_id, er.status, er.registered_at,
                e.event_id, e.title, e.event_date, e.start_time,
                e.end_time, e.location, e.category
            FROM event_registrations er
            JOIN events e ON er.event_id = e.event_id
            WHERE er.user_id = %s
            ORDER BY e.event_date ASC
        """, (current_user_id,))

        registrations = cursor.fetchall()

        registrations_list = []
        for reg in registrations:
            registrations_list.append({
                'registration_id': reg[0],
                'status': reg[1],
                'registered_at': reg[2].isoformat() if reg[2] else None,
                'event': {
                    'event_id': reg[3],
                    'title': reg[4],
                    'event_date': reg[5].isoformat() if reg[5] else None,
                    'start_time': str(reg[6]) if reg[6] else None,
                    'end_time': str(reg[7]) if reg[7] else None,
                    'location': reg[8],
                    'category': reg[9]
                }
            })

        return jsonify({
            'registrations': registrations_list,
            'total': len(registrations_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# =====================================================
# ADMIN EVENT MANAGEMENT
# =====================================================

@event_bp.route('/admin/all', methods=['GET'])
@jwt_required()
@admin_required
def get_all_events_admin():
    """Get all events (admin view)"""
    status = request.args.get('status')

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
            SELECT
                event_id, title, slug, category, event_date,
                start_time, end_time, location, max_participants,
                current_participants, status, created_at
            FROM events
        """
        params = []

        if status:
            query += " WHERE status = %s"
            params.append(status)

        query += " ORDER BY event_date DESC"

        cursor.execute(query, params)
        events = cursor.fetchall()

        events_list = []
        for event in events:
            events_list.append({
                'event_id': event[0],
                'title': event[1],
                'slug': event[2],
                'category': event[3],
                'event_date': event[4].isoformat() if event[4] else None,
                'start_time': str(event[5]) if event[5] else None,
                'end_time': str(event[6]) if event[6] else None,
                'location': event[7],
                'max_participants': event[8],
                'current_participants': event[9],
                'status': event[10],
                'created_at': event[11].isoformat() if event[11] else None
            })

        return jsonify({
            'events': events_list,
            'total': len(events_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@event_bp.route('/admin', methods=['POST'])
@jwt_required()
@admin_required
def create_event():
    """Create a new event (admin only)"""
    current_user_id = get_jwt_identity()
    data = request.json

    # Validate required fields
    required_fields = ['title', 'description', 'event_date', 'start_time', 'end_time']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Create slug
    slug = create_slug(data['title'])

    # Determine status
    status = 'published' if data.get('publish', False) else 'draft'

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if slug exists
        cursor.execute("SELECT event_id FROM events WHERE slug = %s", (slug,))
        if cursor.fetchone():
            slug = f"{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        cursor.execute("""
            INSERT INTO events (
                title, slug, description, category, event_date,
                start_time, end_time, location, max_participants,
                featured_image_url, fee, registration_enabled,
                registration_deadline, send_confirmation_email,
                status, created_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING event_id
        """, (
            data['title'],
            slug,
            data['description'],
            data.get('category'),
            data['event_date'],
            data['start_time'],
            data['end_time'],
            data.get('location'),
            data.get('max_participants'),
            data.get('featured_image_url'),
            data.get('fee', 0),
            data.get('registration_enabled', True),
            data.get('registration_deadline'),
            data.get('send_confirmation_email', True),
            status,
            current_user_id
        ))

        event_id = cursor.fetchone()[0]

        if status == 'published':
            cursor.execute("""
                UPDATE events
                SET published_at = CURRENT_TIMESTAMP
                WHERE event_id = %s
            """, (event_id,))

        conn.commit()

        return jsonify({
            'message': 'Event created successfully',
            'event_id': event_id,
            'slug': slug,
            'status': status
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@event_bp.route('/admin/<int:event_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_event(event_id):
    """Update an event (admin only)"""
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if event exists
        cursor.execute("SELECT event_id FROM events WHERE event_id = %s", (event_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Event not found'}), 404

        # Build update query
        update_fields = []
        params = []

        if 'title' in data:
            update_fields.append("title = %s")
            params.append(data['title'])
            slug = create_slug(data['title'])
            update_fields.append("slug = %s")
            params.append(slug)

        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])

        if 'category' in data:
            update_fields.append("category = %s")
            params.append(data['category'])

        if 'event_date' in data:
            update_fields.append("event_date = %s")
            params.append(data['event_date'])

        if 'start_time' in data:
            update_fields.append("start_time = %s")
            params.append(data['start_time'])

        if 'end_time' in data:
            update_fields.append("end_time = %s")
            params.append(data['end_time'])

        if 'location' in data:
            update_fields.append("location = %s")
            params.append(data['location'])

        if 'max_participants' in data:
            update_fields.append("max_participants = %s")
            params.append(data['max_participants'])

        if 'featured_image_url' in data:
            update_fields.append("featured_image_url = %s")
            params.append(data['featured_image_url'])

        if 'fee' in data:
            update_fields.append("fee = %s")
            params.append(data['fee'])

        if 'registration_enabled' in data:
            update_fields.append("registration_enabled = %s")
            params.append(data['registration_enabled'])

        if 'status' in data:
            update_fields.append("status = %s")
            params.append(data['status'])
            if data['status'] == 'published':
                update_fields.append("published_at = CURRENT_TIMESTAMP")

        params.append(event_id)

        cursor.execute(f"""
            UPDATE events
            SET {', '.join(update_fields)}
            WHERE event_id = %s
        """, params)

        conn.commit()

        return jsonify({'message': 'Event updated successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@event_bp.route('/admin/<int:event_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_event(event_id):
    """Delete an event (admin only)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if event has registrations
        cursor.execute("""
            SELECT COUNT(*) FROM event_registrations WHERE event_id = %s
        """, (event_id,))

        registration_count = cursor.fetchone()[0]

        if registration_count > 0:
            return jsonify({'error': f'Cannot delete event with {registration_count} registrations. Cancel the event instead.'}), 400

        cursor.execute("DELETE FROM events WHERE event_id = %s", (event_id,))
        conn.commit()

        return jsonify({'message': 'Event deleted successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@event_bp.route('/admin/<int:event_id>/registrations', methods=['GET'])
@jwt_required()
@admin_required
def get_event_registrations(event_id):
    """Get all registrations for an event (admin only)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                er.registration_id, er.attendee_name, er.attendee_email,
                er.attendee_phone, er.status, er.payment_status,
                er.registered_at, u.email as user_email
            FROM event_registrations er
            LEFT JOIN users u ON er.user_id = u.user_id
            WHERE er.event_id = %s
            ORDER BY er.registered_at ASC
        """, (event_id,))

        registrations = cursor.fetchall()

        registrations_list = []
        for reg in registrations:
            registrations_list.append({
                'registration_id': reg[0],
                'attendee_name': reg[1],
                'attendee_email': reg[2],
                'attendee_phone': reg[3],
                'status': reg[4],
                'payment_status': reg[5],
                'registered_at': reg[6].isoformat() if reg[6] else None,
                'user_email': reg[7]
            })

        return jsonify({
            'registrations': registrations_list,
            'total': len(registrations_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
