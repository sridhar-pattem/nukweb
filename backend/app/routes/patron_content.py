"""
Patron Content Submission Routes
Handles blog posts, reviews, suggestions, and testimonials from patrons
"""

from flask import Blueprint, request, jsonify
from app.utils.database import get_db_connection
from app.utils.auth import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import re

patron_content_bp = Blueprint('patron_content', __name__)

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def create_slug(title):
    """Create URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def create_notification(user_id, notification_type, title, message, link_url=None):
    """Create a notification for a user"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO notifications (user_id, notification_type, title, message, link_url)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, notification_type, title, message, link_url))

# =====================================================
# DASHBOARD STATS
# =====================================================

@patron_content_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics for the current patron"""
    current_user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            # Get patron_id from user_id
            cursor.execute("""
                SELECT patron_id FROM patrons WHERE user_id = %s
            """, (current_user_id,))

            patron = cursor.fetchone()
            if not patron:
                # User is not a patron, return zero stats
                return jsonify({
                    'total_blog_posts': 0,
                    'total_suggestions': 0,
                    'total_testimonials': 0,
                    'unread_notifications': 0
                }), 200

            patron_id = patron[0]

            # Get total blog posts by this user
            cursor.execute("""
                SELECT COUNT(*) FROM blog_posts WHERE author_id = %s
            """, (current_user_id,))
            total_blog_posts = cursor.fetchone()[0]

            # Get total book suggestions by this patron
            cursor.execute("""
                SELECT COUNT(*) FROM book_suggestions WHERE patron_id = %s
            """, (patron_id,))
            total_suggestions = cursor.fetchone()[0]

            # Get total testimonials by this user
            cursor.execute("""
                SELECT COUNT(*) FROM testimonials WHERE user_id = %s
            """, (current_user_id,))
            total_testimonials = cursor.fetchone()[0]

            # Get unread notifications count
            cursor.execute("""
                SELECT COUNT(*) FROM notifications
                WHERE user_id = %s AND is_read = FALSE
            """, (current_user_id,))
            unread_notifications = cursor.fetchone()[0]

            return jsonify({
                'total_blog_posts': total_blog_posts,
                'total_suggestions': total_suggestions,
                'total_testimonials': total_testimonials,
                'unread_notifications': unread_notifications
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

# =====================================================
# BLOG POSTS
# =====================================================

@patron_content_bp.route('/blog/posts', methods=['GET'])
@jwt_required()
def get_my_blog_posts():
    """Get current user's blog posts"""
    current_user_id = get_jwt_identity()
    status = request.args.get('status', None)

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            query = """
                SELECT
                    post_id, title, slug, excerpt, category, tags,
                    status, view_count, is_featured, published_at,
                    created_at, updated_at, rejection_reason
                FROM blog_posts
                WHERE author_id = %s
            """
            params = [current_user_id]

            if status:
                query += " AND status = %s"
                params.append(status)

            query += " ORDER BY created_at DESC"

            cursor.execute(query, params)
            posts = cursor.fetchall()

            posts_list = []
            for post in posts:
                posts_list.append({
                    'post_id': post[0],
                    'title': post[1],
                    'slug': post[2],
                    'excerpt': post[3],
                    'category': post[4],
                    'tags': post[5],
                    'status': post[6],
                    'view_count': post[7],
                    'is_featured': post[8],
                    'published_at': post[9].isoformat() if post[9] else None,
                    'created_at': post[10].isoformat() if post[10] else None,
                    'updated_at': post[11].isoformat() if post[11] else None,
                    'rejection_reason': post[12]
                })

            return jsonify({
                'posts': posts_list,
                'total': len(posts_list)
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/blog/posts/<int:post_id>', methods=['GET'])
@jwt_required()
def get_blog_post(post_id):
    """Get a specific blog post"""
    current_user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT
                    post_id, author_id, title, slug, excerpt, content,
                    featured_image_url, category, tags, status, rejection_reason,
                    admin_notes, view_count, is_featured, published_at,
                    created_at, updated_at
                FROM blog_posts
                WHERE post_id = %s AND author_id = %s
            """, (post_id, current_user_id))

            post = cursor.fetchone()

            if not post:
                return jsonify({'error': 'Post not found'}), 404

            return jsonify({
                'post_id': post[0],
                'author_id': post[1],
                'title': post[2],
                'slug': post[3],
                'excerpt': post[4],
                'content': post[5],
                'featured_image_url': post[6],
                'category': post[7],
                'tags': post[8],
                'status': post[9],
                'rejection_reason': post[10],
                'admin_notes': post[11],
                'view_count': post[12],
                'is_featured': post[13],
                'published_at': post[14].isoformat() if post[14] else None,
                'created_at': post[15].isoformat() if post[15] else None,
                'updated_at': post[16].isoformat() if post[16] else None
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/blog/posts', methods=['POST'])
@jwt_required()
def create_blog_post():
    """Create a new blog post (draft or submit for review)"""
    current_user_id = get_jwt_identity()
    data = request.json

    # Validate required fields
    if not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400

    # Create slug from title
    slug = create_slug(data['title'])

    # Determine status: draft or pending
    status = 'pending' if data.get('submit', False) else 'draft'

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            # Check if slug already exists
            cursor.execute("SELECT post_id FROM blog_posts WHERE slug = %s", (slug,))
            if cursor.fetchone():
                slug = f"{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}"

            cursor.execute("""
                INSERT INTO blog_posts (
                    author_id, title, slug, excerpt, content,
                    featured_image_url, category, tags, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING post_id
            """, (
                current_user_id,
                data['title'],
                slug,
                data.get('excerpt'),
                data['content'],
                data.get('featured_image_url'),
                data.get('category'),
                data.get('tags', []),
                status
            ))

            post_id = cursor.fetchone()[0]
        # conn.commit() # Handled by context manager

            # Create notification if submitted for review
            if status == 'pending':
                # Notify admins
                cursor.execute("SELECT user_id FROM users WHERE role = 'admin'")
                admin_users = cursor.fetchall()
                for admin in admin_users:
                    create_notification(
                        admin[0],
                        'new_blog_post',
                        'New Blog Post Pending Review',
                        f'"{data["title"]}" has been submitted for review',
                        f'/admin/content/blog/{post_id}'
                    )

            return jsonify({
                'message': 'Blog post created successfully',
                'post_id': post_id,
                'slug': slug,
                'status': status
            }), 201

        except Exception as e:
        # conn.rollback() # Handled by context manager
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/blog/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_blog_post(post_id):
    """Update a blog post"""
    current_user_id = get_jwt_identity()
    data = request.json

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            # Verify ownership
            cursor.execute("""
                SELECT status FROM blog_posts
                WHERE post_id = %s AND author_id = %s
            """, (post_id, current_user_id))

            result = cursor.fetchone()
            if not result:
                return jsonify({'error': 'Post not found'}), 404

            current_status = result[0]

            # Can only edit draft or posts with changes requested
            if current_status not in ['draft', 'changes_requested']:
                return jsonify({'error': 'Cannot edit published or pending posts'}), 403

            # Update slug if title changed
            slug = None
            if data.get('title'):
                slug = create_slug(data['title'])
                cursor.execute("""
                    SELECT post_id FROM blog_posts
                    WHERE slug = %s AND post_id != %s
                """, (slug, post_id))
                if cursor.fetchone():
                    slug = f"{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}"

            # Determine new status
            new_status = 'pending' if data.get('submit', False) else 'draft'

            # Build update query
            update_fields = []
            params = []

            if data.get('title'):
                update_fields.append("title = %s")
                params.append(data['title'])
                update_fields.append("slug = %s")
                params.append(slug)

            if 'excerpt' in data:
                update_fields.append("excerpt = %s")
                params.append(data['excerpt'])

            if 'content' in data:
                update_fields.append("content = %s")
                params.append(data['content'])

            if 'featured_image_url' in data:
                update_fields.append("featured_image_url = %s")
                params.append(data['featured_image_url'])

            if 'category' in data:
                update_fields.append("category = %s")
                params.append(data['category'])

            if 'tags' in data:
                update_fields.append("tags = %s")
                params.append(data['tags'])

            update_fields.append("status = %s")
            params.append(new_status)

            params.append(post_id)

            cursor.execute(f"""
                UPDATE blog_posts
                SET {', '.join(update_fields)}
                WHERE post_id = %s
            """, params)

        # conn.commit() # Handled by context manager

            return jsonify({
                'message': 'Blog post updated successfully',
                'status': new_status
            }), 200

        except Exception as e:
        # conn.rollback() # Handled by context manager
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/blog/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_blog_post(post_id):
    """Delete a blog post"""
    current_user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            # Verify ownership and check status
            cursor.execute("""
                SELECT status FROM blog_posts
                WHERE post_id = %s AND author_id = %s
            """, (post_id, current_user_id))

            result = cursor.fetchone()
            if not result:
                return jsonify({'error': 'Post not found'}), 404

            # Can only delete drafts or rejected posts
            if result[0] not in ['draft', 'rejected']:
                return jsonify({'error': 'Cannot delete published or pending posts'}), 403

            cursor.execute("DELETE FROM blog_posts WHERE post_id = %s", (post_id,))
        # conn.commit() # Handled by context manager

            return jsonify({'message': 'Blog post deleted successfully'}), 200

        except Exception as e:
        # conn.rollback() # Handled by context manager
            return jsonify({'error': str(e)}), 500

# =====================================================
# BOOK SUGGESTIONS
# =====================================================

@patron_content_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_my_suggestions():
    """Get current patron's book suggestions"""
    current_user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            # Get patron_id from user_id
            cursor.execute("""
                SELECT patron_id FROM patrons WHERE user_id = %s
            """, (current_user_id,))

            patron = cursor.fetchone()
            if not patron:
                return jsonify({'error': 'Patron not found'}), 404

            patron_id = patron[0]

            cursor.execute("""
                SELECT
                    suggestion_id, title, authors, isbn, category,
                    recommended_for, reason, interest_level, status,
                    admin_response, created_at, reviewed_at
                FROM book_suggestions
                WHERE patron_id = %s
                ORDER BY created_at DESC
            """, (patron_id,))

            suggestions = cursor.fetchall()

            suggestions_list = []
            for sug in suggestions:
                suggestions_list.append({
                    'suggestion_id': sug[0],
                    'title': sug[1],
                    'authors': sug[2],
                    'isbn': sug[3],
                    'category': sug[4],
                    'recommended_for': sug[5],
                    'reason': sug[6],
                    'interest_level': sug[7],
                    'status': sug[8],
                    'admin_response': sug[9],
                    'created_at': sug[10].isoformat() if sug[10] else None,
                    'reviewed_at': sug[11].isoformat() if sug[11] else None
                })

            return jsonify({
                'suggestions': suggestions_list,
                'total': len(suggestions_list)
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/suggestions', methods=['POST'])
@jwt_required()
def create_suggestion():
    """Submit a book suggestion"""
    current_user_id = get_jwt_identity()
    data = request.json

    # Validate required fields
    required_fields = ['title', 'authors', 'reason']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            # Get patron_id
            cursor.execute("""
                SELECT patron_id FROM patrons WHERE user_id = %s
            """, (current_user_id,))

            patron = cursor.fetchone()
            if not patron:
                return jsonify({'error': 'Patron not found'}), 404

            patron_id = patron[0]

            cursor.execute("""
                INSERT INTO book_suggestions (
                    patron_id, title, authors, isbn, category,
                    recommended_for, reason, interest_level
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING suggestion_id
            """, (
                patron_id,
                data['title'],
                data['authors'],
                data.get('isbn'),
                data.get('category'),
                data.get('recommended_for'),
                data['reason'],
                data.get('interest_level', 'few_people')
            ))

            suggestion_id = cursor.fetchone()[0]
        # conn.commit() # Handled by context manager

            # Notify admins
            cursor.execute("SELECT user_id FROM users WHERE role = 'admin'")
            admin_users = cursor.fetchall()
            for admin in admin_users:
                create_notification(
                    admin[0],
                    'new_book_suggestion',
                    'New Book Suggestion',
                    f'"{data["title"]}" by {data["authors"]}',
                    f'/admin/content/suggestions/{suggestion_id}'
                )

            return jsonify({
                'message': 'Book suggestion submitted successfully',
                'suggestion_id': suggestion_id
            }), 201

        except Exception as e:
        # conn.rollback() # Handled by context manager
            return jsonify({'error': str(e)}), 500

# =====================================================
# TESTIMONIALS
# =====================================================

@patron_content_bp.route('/testimonials', methods=['GET'])
@jwt_required()
def get_my_testimonials():
    """Get current user's testimonials"""
    current_user_id = get_jwt_identity()
    limit = request.args.get('limit', type=int, default=20)

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            cursor.execute("""
                SELECT
                    testimonial_id, testimonial_text, rating,
                    display_name, user_role, status,
                    created_at, updated_at
                FROM testimonials
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s
            """, (current_user_id, limit))

            testimonials = cursor.fetchall()

            testimonials_list = []
            for test in testimonials:
                testimonials_list.append({
                    'testimonial_id': test[0],
                    'testimonial_text': test[1],
                    'rating': test[2],
                    'display_name': test[3],
                    'user_role': test[4],
                    'status': test[5],
                    'created_at': test[6].isoformat() if test[6] else None,
                    'updated_at': test[7].isoformat() if test[7] else None
                })

            return jsonify({
                'testimonials': testimonials_list,
                'total': len(testimonials_list)
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/testimonials', methods=['POST'])
@jwt_required()
def submit_testimonial():
    """Submit a testimonial"""
    current_user_id = get_jwt_identity()
    data = request.json

    # Validate required fields
    if not data.get('testimonial_text') or not data.get('rating'):
        return jsonify({'error': 'Testimonial text and rating are required'}), 400

    if not (1 <= data['rating'] <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO testimonials (
                    user_id, testimonial_text, rating, display_name, user_role
                ) VALUES (%s, %s, %s, %s, %s)
                RETURNING testimonial_id
            """, (
                current_user_id,
                data['testimonial_text'],
                data['rating'],
                data.get('display_name'),
                data.get('user_role')
            ))

            testimonial_id = cursor.fetchone()[0]
        # conn.commit() # Handled by context manager

            return jsonify({
                'message': 'Testimonial submitted successfully. It will be reviewed before publishing.',
                'testimonial_id': testimonial_id
            }), 201

        except Exception as e:
        # conn.rollback() # Handled by context manager
            return jsonify({'error': str(e)}), 500

# =====================================================
# NOTIFICATIONS
# =====================================================

@patron_content_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user's notifications"""
    current_user_id = get_jwt_identity()
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    limit = int(request.args.get('limit', 20))

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            query = """
                SELECT
                    notification_id, notification_type, title, message,
                    link_url, is_read, created_at
                FROM notifications
                WHERE user_id = %s
            """
            params = [current_user_id]

            if unread_only:
                query += " AND is_read = FALSE"

            query += " ORDER BY created_at DESC LIMIT %s"
            params.append(limit)

            cursor.execute(query, params)
            notifications = cursor.fetchall()

            notifications_list = []
            for notif in notifications:
                notifications_list.append({
                    'notification_id': notif[0],
                    'type': notif[1],
                    'title': notif[2],
                    'message': notif[3],
                    'link_url': notif[4],
                    'is_read': notif[5],
                    'created_at': notif[6].isoformat() if notif[6] else None
                })

            # Get unread count
            cursor.execute("""
                SELECT COUNT(*) FROM notifications
                WHERE user_id = %s AND is_read = FALSE
            """, (current_user_id,))

            unread_count = cursor.fetchone()[0]

            return jsonify({
                'notifications': notifications_list,
                'unread_count': unread_count
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    current_user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE notifications
                SET is_read = TRUE
                WHERE notification_id = %s AND user_id = %s
            """, (notification_id, current_user_id))

        # conn.commit() # Handled by context manager

            return jsonify({'message': 'Notification marked as read'}), 200

        except Exception as e:
        # conn.rollback() # Handled by context manager
            return jsonify({'error': str(e)}), 500

@patron_content_bp.route('/notifications/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read"""
    current_user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cursor = conn.cursor()

        try:
            cursor.execute("""
                UPDATE notifications
                SET is_read = TRUE
                WHERE user_id = %s AND is_read = FALSE
            """, (current_user_id,))

        # conn.commit() # Handled by context manager

            return jsonify({'message': 'All notifications marked as read'}), 200

        except Exception as e:
        # conn.rollback() # Handled by context manager
            return jsonify({'error': str(e)}), 500
