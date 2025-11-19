"""
Admin Content Moderation Routes
Handles approval, rejection, and management of user-submitted content
"""

from flask import Blueprint, request, jsonify
from app.utils.database import get_db_connection
from app.utils.auth import admin_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

admin_content_bp = Blueprint('admin_content', __name__)

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def create_notification(user_id, notification_type, title, message, link_url=None):
    """Create a notification for a user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO notifications (user_id, notification_type, title, message, link_url)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, notification_type, title, message, link_url))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def log_moderation_action(content_type, content_id, action, moderator_id, notes=None):
    """Log a moderation action"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO content_moderation_log (content_type, content_id, action, moderator_id, notes)
            VALUES (%s, %s, %s, %s, %s)
        """, (content_type, content_id, action, moderator_id, notes))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

# =====================================================
# BLOG POST MODERATION
# =====================================================

@admin_content_bp.route('/blog/pending', methods=['GET'])
@jwt_required()
@admin_required
def get_pending_blog_posts():
    """Get all pending blog posts"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                bp.post_id, bp.title, bp.excerpt, bp.category, bp.tags,
                bp.status, bp.created_at, bp.updated_at,
                u.email,
                p.first_name || ' ' || p.last_name as author_name
            FROM blog_posts bp
            JOIN users u ON bp.author_id = u.user_id
            LEFT JOIN patrons p ON u.user_id = p.user_id
            WHERE bp.status = 'pending'
            ORDER BY bp.created_at ASC
        """)

        posts = cursor.fetchall()

        posts_list = []
        for post in posts:
            posts_list.append({
                'post_id': post[0],
                'title': post[1],
                'excerpt': post[2],
                'category': post[3],
                'tags': post[4],
                'status': post[5],
                'created_at': post[6].isoformat() if post[6] else None,
                'updated_at': post[7].isoformat() if post[7] else None,
                'author_email': post[8],
                'author_name': post[9]
            })

        return jsonify({
            'posts': posts_list,
            'total': len(posts_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/blog/<int:post_id>/full', methods=['GET'])
@jwt_required()
@admin_required
def get_full_blog_post(post_id):
    """Get full blog post details for review"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                bp.post_id, bp.author_id, bp.title, bp.slug, bp.excerpt,
                bp.content, bp.featured_image_url, bp.category, bp.tags,
                bp.status, bp.view_count, bp.created_at, bp.updated_at,
                u.email,
                p.first_name || ' ' || p.last_name as author_name
            FROM blog_posts bp
            JOIN users u ON bp.author_id = u.user_id
            LEFT JOIN patrons p ON u.user_id = p.user_id
            WHERE bp.post_id = %s
        """, (post_id,))

        post = cursor.fetchone()

        if not post:
            return jsonify({'error': 'Post not found'}), 404

        # Get word count and basic stats
        word_count = len(post[5].split()) if post[5] else 0

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
            'view_count': post[10],
            'created_at': post[11].isoformat() if post[11] else None,
            'updated_at': post[12].isoformat() if post[12] else None,
            'author_email': post[13],
            'author_name': post[14],
            'word_count': word_count
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/blog/<int:post_id>/approve', methods=['POST'])
@jwt_required()
@admin_required
def approve_blog_post(post_id):
    """Approve and publish a blog post"""
    current_user_id = get_jwt_identity()
    data = request.json

    publish_immediately = data.get('publish_immediately', True)
    is_featured = data.get('is_featured', False)
    admin_notes = data.get('admin_notes')
    scheduled_for = data.get('scheduled_for')

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get post details
        cursor.execute("""
            SELECT author_id, title FROM blog_posts WHERE post_id = %s
        """, (post_id,))

        post = cursor.fetchone()
        if not post:
            return jsonify({'error': 'Post not found'}), 404

        author_id = post[0]
        title = post[1]

        # Update post status
        if publish_immediately:
            cursor.execute("""
                UPDATE blog_posts
                SET status = 'published',
                    approved_by = %s,
                    approved_at = CURRENT_TIMESTAMP,
                    published_at = CURRENT_TIMESTAMP,
                    is_featured = %s,
                    admin_notes = %s
                WHERE post_id = %s
            """, (current_user_id, is_featured, admin_notes, post_id))
        else:
            cursor.execute("""
                UPDATE blog_posts
                SET status = 'approved',
                    approved_by = %s,
                    approved_at = CURRENT_TIMESTAMP,
                    scheduled_for = %s,
                    is_featured = %s,
                    admin_notes = %s
                WHERE post_id = %s
            """, (current_user_id, scheduled_for, is_featured, admin_notes, post_id))

        conn.commit()

        # Log the action
        log_moderation_action('blog_post', post_id, 'approved', current_user_id, admin_notes)

        # Notify author
        message = f'Your blog post "{title}" has been approved and published!' if publish_immediately else f'Your blog post "{title}" has been approved and will be published soon.'
        create_notification(
            author_id,
            'post_approved',
            'Blog Post Approved!',
            message,
            f'/patron/content/blog/{post_id}'
        )

        return jsonify({
            'message': 'Blog post approved successfully',
            'status': 'published' if publish_immediately else 'approved'
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/blog/<int:post_id>/request-changes', methods=['POST'])
@jwt_required()
@admin_required
def request_blog_changes(post_id):
    """Request changes to a blog post"""
    current_user_id = get_jwt_identity()
    data = request.json

    feedback = data.get('feedback')
    if not feedback:
        return jsonify({'error': 'Feedback is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get post details
        cursor.execute("""
            SELECT author_id, title FROM blog_posts WHERE post_id = %s
        """, (post_id,))

        post = cursor.fetchone()
        if not post:
            return jsonify({'error': 'Post not found'}), 404

        author_id = post[0]
        title = post[1]

        # Update post status
        cursor.execute("""
            UPDATE blog_posts
            SET status = 'changes_requested',
                admin_notes = %s
            WHERE post_id = %s
        """, (feedback, post_id))

        conn.commit()

        # Log the action
        log_moderation_action('blog_post', post_id, 'changes_requested', current_user_id, feedback)

        # Notify author
        create_notification(
            author_id,
            'changes_requested',
            'Changes Requested for Your Blog Post',
            f'Your blog post "{title}" needs some revisions. Please review the feedback.',
            f'/patron/content/blog/{post_id}'
        )

        return jsonify({'message': 'Feedback sent to author'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/blog/<int:post_id>/reject', methods=['POST'])
@jwt_required()
@admin_required
def reject_blog_post(post_id):
    """Reject a blog post"""
    current_user_id = get_jwt_identity()
    data = request.json

    reason = data.get('reason')
    explanation = data.get('explanation')

    if not reason or not explanation:
        return jsonify({'error': 'Reason and explanation are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get post details
        cursor.execute("""
            SELECT author_id, title FROM blog_posts WHERE post_id = %s
        """, (post_id,))

        post = cursor.fetchone()
        if not post:
            return jsonify({'error': 'Post not found'}), 404

        author_id = post[0]
        title = post[1]

        # Update post status
        cursor.execute("""
            UPDATE blog_posts
            SET status = 'rejected',
                rejection_reason = %s
            WHERE post_id = %s
        """, (f"{reason}: {explanation}", post_id))

        conn.commit()

        # Log the action
        log_moderation_action('blog_post', post_id, 'rejected', current_user_id, f"{reason}: {explanation}")

        # Notify author
        create_notification(
            author_id,
            'post_rejected',
            'Blog Post Not Approved',
            f'Your blog post "{title}" was not approved. Reason: {reason}',
            f'/patron/content/blog/{post_id}'
        )

        return jsonify({'message': 'Blog post rejected'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# =====================================================
# BOOK SUGGESTIONS MODERATION
# =====================================================

@admin_content_bp.route('/suggestions/pending', methods=['GET'])
@jwt_required()
@admin_required
def get_pending_suggestions():
    """Get all pending book suggestions"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                bs.suggestion_id, bs.title, bs.authors, bs.isbn,
                bs.category, bs.recommended_for, bs.reason,
                bs.interest_level, bs.created_at,
                p.first_name || ' ' || p.last_name as patron_name
            FROM book_suggestions bs
            JOIN patrons p ON bs.patron_id = p.patron_id
            WHERE bs.status = 'pending'
            ORDER BY bs.created_at ASC
        """)

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
                'created_at': sug[8].isoformat() if sug[8] else None,
                'patron_name': sug[9]
            })

        return jsonify({
            'suggestions': suggestions_list,
            'total': len(suggestions_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/suggestions/<int:suggestion_id>/approve', methods=['POST'])
@jwt_required()
@admin_required
def approve_suggestion(suggestion_id):
    """Approve a book suggestion"""
    current_user_id = get_jwt_identity()
    data = request.json

    response = data.get('response', 'Thank you for your suggestion! We will add this book to our collection.')

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get suggestion details
        cursor.execute("""
            SELECT p.user_id, bs.title
            FROM book_suggestions bs
            JOIN patrons p ON bs.patron_id = p.patron_id
            WHERE bs.suggestion_id = %s
        """, (suggestion_id,))

        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Suggestion not found'}), 404

        user_id = result[0]
        title = result[1]

        # Update suggestion status
        cursor.execute("""
            UPDATE book_suggestions
            SET status = 'approved',
                admin_response = %s,
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = %s
            WHERE suggestion_id = %s
        """, (response, current_user_id, suggestion_id))

        conn.commit()

        # Log the action
        log_moderation_action('book_suggestion', suggestion_id, 'approved', current_user_id, response)

        # Notify patron
        create_notification(
            user_id,
            'suggestion_approved',
            'Book Suggestion Approved!',
            f'Your suggestion "{title}" has been approved! {response}',
            f'/patron/content/suggestions/{suggestion_id}'
        )

        return jsonify({'message': 'Suggestion approved successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/suggestions/<int:suggestion_id>/reject', methods=['POST'])
@jwt_required()
@admin_required
def reject_suggestion(suggestion_id):
    """Reject a book suggestion"""
    current_user_id = get_jwt_identity()
    data = request.json

    response = data.get('response')
    if not response:
        return jsonify({'error': 'Response is required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get suggestion details
        cursor.execute("""
            SELECT p.user_id, bs.title
            FROM book_suggestions bs
            JOIN patrons p ON bs.patron_id = p.patron_id
            WHERE bs.suggestion_id = %s
        """, (suggestion_id,))

        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Suggestion not found'}), 404

        user_id = result[0]
        title = result[1]

        # Update suggestion status
        cursor.execute("""
            UPDATE book_suggestions
            SET status = 'rejected',
                admin_response = %s,
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = %s
            WHERE suggestion_id = %s
        """, (response, current_user_id, suggestion_id))

        conn.commit()

        # Log the action
        log_moderation_action('book_suggestion', suggestion_id, 'rejected', current_user_id, response)

        # Notify patron
        create_notification(
            user_id,
            'suggestion_rejected',
            'Book Suggestion Update',
            f'Regarding your suggestion "{title}": {response}',
            f'/patron/content/suggestions/{suggestion_id}'
        )

        return jsonify({'message': 'Suggestion rejected'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# =====================================================
# TESTIMONIALS MODERATION
# =====================================================

@admin_content_bp.route('/testimonials/pending', methods=['GET'])
@jwt_required()
@admin_required
def get_pending_testimonials():
    """Get all pending testimonials"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                t.testimonial_id, t.testimonial_text, t.rating,
                t.display_name, t.user_role, t.created_at,
                u.email,
                COALESCE(p.first_name || ' ' || p.last_name, u.email) as name
            FROM testimonials t
            JOIN users u ON t.user_id = u.user_id
            LEFT JOIN patrons p ON u.user_id = p.user_id
            WHERE t.status = 'pending'
            ORDER BY t.created_at ASC
        """)

        testimonials = cursor.fetchall()

        testimonials_list = []
        for test in testimonials:
            testimonials_list.append({
                'testimonial_id': test[0],
                'testimonial_text': test[1],
                'rating': test[2],
                'display_name': test[3],
                'user_role': test[4],
                'created_at': test[5].isoformat() if test[5] else None,
                'email': test[6],
                'name': test[7]
            })

        return jsonify({
            'testimonials': testimonials_list,
            'total': len(testimonials_list)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/testimonials/<int:testimonial_id>/approve', methods=['POST'])
@jwt_required()
@admin_required
def approve_testimonial(testimonial_id):
    """Approve a testimonial"""
    current_user_id = get_jwt_identity()
    data = request.json

    is_featured = data.get('is_featured', False)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get testimonial details
        cursor.execute("""
            SELECT user_id FROM testimonials WHERE testimonial_id = %s
        """, (testimonial_id,))

        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Testimonial not found'}), 404

        user_id = result[0]

        # Update testimonial status
        cursor.execute("""
            UPDATE testimonials
            SET status = 'approved',
                is_featured = %s,
                approved_at = CURRENT_TIMESTAMP,
                approved_by = %s
            WHERE testimonial_id = %s
        """, (is_featured, current_user_id, testimonial_id))

        conn.commit()

        # Log the action
        log_moderation_action('testimonial', testimonial_id, 'approved', current_user_id)

        # Notify user
        create_notification(
            user_id,
            'testimonial_approved',
            'Testimonial Approved!',
            'Thank you! Your testimonial has been approved and is now live on our website.',
            None
        )

        return jsonify({'message': 'Testimonial approved successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_content_bp.route('/testimonials/<int:testimonial_id>/reject', methods=['POST'])
@jwt_required()
@admin_required
def reject_testimonial(testimonial_id):
    """Reject a testimonial"""
    current_user_id = get_jwt_identity()

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get testimonial details
        cursor.execute("""
            SELECT user_id FROM testimonials WHERE testimonial_id = %s
        """, (testimonial_id,))

        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Testimonial not found'}), 404

        user_id = result[0]

        # Update testimonial status
        cursor.execute("""
            UPDATE testimonials
            SET status = 'rejected'
            WHERE testimonial_id = %s
        """, (testimonial_id,))

        conn.commit()

        # Log the action
        log_moderation_action('testimonial', testimonial_id, 'rejected', current_user_id)

        return jsonify({'message': 'Testimonial rejected'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# =====================================================
# DASHBOARD & ANALYTICS
# =====================================================

@admin_content_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    """Get content moderation dashboard statistics"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get pending counts
        cursor.execute("SELECT * FROM pending_content_summary")
        pending_counts = {}
        for row in cursor.fetchall():
            pending_counts[row[0]] = row[1]

        # Get total published blog posts
        cursor.execute("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'")
        total_published_posts = cursor.fetchone()[0]

        # Get approval rate (last 30 days)
        cursor.execute("""
            SELECT
                COUNT(*) FILTER (WHERE action = 'approved') as approved,
                COUNT(*) FILTER (WHERE action = 'rejected') as rejected,
                COUNT(*) as total
            FROM content_moderation_log
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        """)
        moderation_stats = cursor.fetchone()

        approval_rate = 0
        if moderation_stats[2] > 0:
            approval_rate = round((moderation_stats[0] / moderation_stats[2]) * 100, 1)

        # Top contributors
        cursor.execute("""
            SELECT
                p.first_name || ' ' || p.last_name as name,
                COUNT(bp.post_id) as post_count
            FROM users u
            JOIN patrons p ON u.user_id = p.user_id
            LEFT JOIN blog_posts bp ON u.user_id = bp.author_id AND bp.status = 'published'
            GROUP BY p.first_name, p.last_name
            ORDER BY post_count DESC
            LIMIT 5
        """)
        top_contributors = []
        for row in cursor.fetchall():
            top_contributors.append({
                'name': row[0],
                'post_count': row[1]
            })

        return jsonify({
            'pending_counts': pending_counts,
            'total_published_posts': total_published_posts,
            'approval_rate': approval_rate,
            'top_contributors': top_contributors
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
