"""
Firebase Cloud Functions for GNK Continuum - Tasker Profile System
Python-based functions for profile processing, analytics, and dashboard generation
"""

from firebase_functions import https_fn, firestore_fn, options
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app, firestore
from firebase_functions.firestore_fn import Event, Change
from datetime import datetime
from typing import Any, Dict
import json

# Initialize Firebase Admin
initialize_app()

# Set global options for cost control
set_global_options(max_instances=10)


# ============================================================================
# FIRESTORE TRIGGERS
# ============================================================================

@firestore_fn.on_document_created(document="taskerProfiles/{profileId}")
def on_tasker_profile_create(event: firestore_fn.Event[firestore.DocumentSnapshot]) -> None:
    """
    Triggered when a new tasker profile is created.
    Initializes dashboard data and sets up analytics tracking.
    """
    profile_data = event.data.to_dict()
    profile_id = event.params.get("profileId")
    
    if not profile_data:
        return
    
    db = firestore.client()
    
    # Initialize dashboard data
    dashboard_data = {
        "userId": profile_data.get("userId", ""),
        "profileId": profile_id,
        "completionHistory": [{
            "date": firestore.SERVER_TIMESTAMP,
            "percentage": profile_data.get("completionPercentage", 0),
        }],
        "analytics": {
            "skillsDistribution": {},
            "experienceBreakdown": {},
            "categoryStats": {},
        },
        "performanceTrends": {
            "tasksCompleted": [],
            "ratings": [],
            "slaReliability": [],
        },
        "taskAchieverProgress": {
            "tasksCompleted": {"current": 0, "required": 10},
            "rating": {"current": 0.0, "required": 4.5},
            "slaReliability": {"current": 0, "required": 95},
            "completionRate": {"current": profile_data.get("completionPercentage", 0), "required": 90},
        },
        "lastUpdated": firestore.SERVER_TIMESTAMP,
        "generatedAt": firestore.SERVER_TIMESTAMP,
    }
    
    # Save to dashboard collection
    db.collection("taskerDashboardData").document(profile_id).set(dashboard_data)
    
    print(f"Dashboard data initialized for profile: {profile_id}")


@firestore_fn.on_document_updated(document="taskerProfiles/{profileId}")
def on_tasker_profile_update(event: firestore_fn.Event[Change[firestore.DocumentSnapshot]]) -> None:
    """
    Triggered when a tasker profile is updated.
    Recalculates metrics, updates dashboard, and checks TaskAchiever eligibility.
    """
    before_data = event.data.before.to_dict() if event.data.before else {}
    after_data = event.data.after.to_dict() if event.data.after else {}
    profile_id = event.params.get("profileId")
    
    if not after_data:
        return
    
    db = firestore.client()
    profile_ref = db.collection("taskerProfiles").document(profile_id)
    dashboard_ref = db.collection("taskerDashboardData").document(profile_id)
    
    updates = {}
    
    # Track completion percentage changes
    old_completion = before_data.get("completionPercentage", 0)
    new_completion = after_data.get("completionPercentage", 0)
    
    if old_completion != new_completion:
        # Add to completion history
        dashboard_ref.update({
            "completionHistory": firestore.ArrayUnion([{
                "date": firestore.SERVER_TIMESTAMP,
                "percentage": new_completion,
            }]),
            "lastUpdated": firestore.SERVER_TIMESTAMP,
        })
    
    # Check TaskAchiever eligibility
    is_eligible = check_task_achiever_eligibility(after_data)
    current_eligible = after_data.get("isTaskAchieverEligible", False)
    
    if is_eligible != current_eligible:
        updates["isTaskAchieverEligible"] = is_eligible
        updates["taskAchieverStatus"] = "eligible" if is_eligible else "not-eligible"
        
        if is_eligible:
            updates["taskAchieverApprovedAt"] = firestore.SERVER_TIMESTAMP
    
    # Update analytics
    analytics = generate_analytics(after_data)
    dashboard_ref.update({
        "analytics": analytics,
        "taskAchieverProgress": calculate_task_achiever_progress(after_data),
        "lastUpdated": firestore.SERVER_TIMESTAMP,
    })
    
    # Update profile if needed
    if updates:
        profile_ref.update(updates)
    
    print(f"Profile updated: {profile_id}, Eligible: {is_eligible}")


# ============================================================================
# HTTP CALLABLE FUNCTIONS
# ============================================================================

@https_fn.on_call()
def generate_dashboard_data(req: https_fn.CallableRequest) -> Dict[str, Any]:
    """
    Callable function to generate comprehensive dashboard data for a tasker profile.
    Returns analytics, trends, and TaskAchiever progress.
    """
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="User must be authenticated"
        )
    
    user_id = req.auth.uid
    db = firestore.client()
    
    # Get profile
    profile_doc = db.collection("taskerProfiles").document(user_id).get()
    
    if not profile_doc.exists:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.NOT_FOUND,
            message="Profile not found"
        )
    
    profile_data = profile_doc.to_dict()
    
    # Generate comprehensive analytics
    analytics = generate_analytics(profile_data)
    performance_trends = generate_performance_trends(profile_data)
    task_achiever_progress = calculate_task_achiever_progress(profile_data)
    
    # Update dashboard data
    dashboard_data = {
        "userId": user_id,
        "profileId": user_id,
        "analytics": analytics,
        "performanceTrends": performance_trends,
        "taskAchieverProgress": task_achiever_progress,
        "lastUpdated": firestore.SERVER_TIMESTAMP,
    }
    
    db.collection("taskerDashboardData").document(user_id).set(dashboard_data, merge=True)
    
    return {
        "success": True,
        "data": {
            "analytics": analytics,
            "performanceTrends": performance_trends,
            "taskAchieverProgress": task_achiever_progress,
        }
    }


@https_fn.on_call()
def calculate_profile_metrics(req: https_fn.CallableRequest) -> Dict[str, Any]:
    """
    Callable function to calculate and update profile metrics.
    """
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="User must be authenticated"
        )
    
    user_id = req.auth.uid
    db = firestore.client()
    
    profile_ref = db.collection("taskerProfiles").document(user_id)
    profile_doc = profile_ref.get()
    
    if not profile_doc.exists:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.NOT_FOUND,
            message="Profile not found"
        )
    
    profile_data = profile_doc.to_dict()
    
    # Calculate completion percentage
    completion = calculate_completion_percentage(profile_data)
    
    # Check eligibility
    is_eligible = check_task_achiever_eligibility(profile_data)
    
    # Update profile
    profile_ref.update({
        "completionPercentage": completion,
        "isTaskAchieverEligible": is_eligible,
        "taskAchieverStatus": "eligible" if is_eligible else "not-eligible",
        "updatedAt": firestore.SERVER_TIMESTAMP,
    })
    
    return {
        "success": True,
        "completionPercentage": completion,
        "isTaskAchieverEligible": is_eligible,
    }


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def check_task_achiever_eligibility(profile_data: Dict[str, Any]) -> bool:
    """Check if profile meets TaskAchiever eligibility criteria."""
    metrics = profile_data.get("metrics", {})
    criteria = profile_data.get("taskAchieverCriteria", {})
    
    tasks_completed = metrics.get("tasksCompleted", 0)
    rating = metrics.get("averageRating", 0.0)
    sla_reliability = metrics.get("slaReliability", 0)
    completion_percentage = profile_data.get("completionPercentage", 0)
    
    min_tasks = criteria.get("minimumTasksCompleted", 10)
    min_rating = criteria.get("minimumRating", 4.5)
    min_sla = criteria.get("minimumSlaReliability", 95)
    min_completion = 90
    
    return (
        tasks_completed >= min_tasks and
        rating >= min_rating and
        sla_reliability >= min_sla and
        completion_percentage >= min_completion
    )


def calculate_completion_percentage(profile_data: Dict[str, Any]) -> int:
    """Calculate profile completion percentage."""
    completed = 0
    total = 0
    
    # Personal Info
    personal = profile_data.get("personalInfo", {})
    total += 3
    if personal.get("firstName"): completed += 1
    if personal.get("lastName"): completed += 1
    if personal.get("displayName"): completed += 1
    
    # Professional Info
    professional = profile_data.get("professionalInfo", {})
    total += 2
    if professional.get("title"): completed += 1
    if professional.get("yearsOfExperience", 0) > 0: completed += 1
    
    # Skills
    skills = profile_data.get("skills", {})
    total += 1
    if len(skills.get("primary", [])) > 0: completed += 1
    
    # Preferences
    preferences = profile_data.get("workPreferences", {})
    total += 2
    if preferences.get("availability"): completed += 1
    if preferences.get("location"): completed += 1
    
    # Specialties
    total += 1
    if len(profile_data.get("specialties", [])) > 0: completed += 1
    
    return int((completed / total) * 100) if total > 0 else 0


def generate_analytics(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate analytics data for dashboard."""
    skills = profile_data.get("skills", {})
    portfolio = profile_data.get("portfolio", {})
    professional = profile_data.get("professionalInfo", {})
    
    # Skills distribution
    skills_dist = {}
    for skill in skills.get("primary", []):
        skills_dist[skill] = skills_dist.get(skill, 0) + 2
    for skill in skills.get("secondary", []):
        skills_dist[skill] = skills_dist.get(skill, 0) + 1
    
    # Experience breakdown
    experience_level = professional.get("experienceLevel", "mid")
    experience_breakdown = {experience_level: 1}
    
    # Category stats
    category_stats = {}
    for project in portfolio.get("projects", []):
        category = project.get("category", "uncategorized")
        category_stats[category] = category_stats.get(category, 0) + 1
    
    return {
        "skillsDistribution": skills_dist,
        "experienceBreakdown": experience_breakdown,
        "categoryStats": category_stats,
    }


def generate_performance_trends(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate performance trend data."""
    metrics = profile_data.get("metrics", {})
    
    # Generate mock trend data (12 months)
    # In production, this would come from historical data
    base_tasks = metrics.get("tasksCompleted", 0)
    base_rating = metrics.get("averageRating", 0.0)
    base_sla = metrics.get("slaReliability", 0)
    
    trends = {
        "tasksCompleted": [],
        "ratings": [],
        "slaReliability": [],
    }
    
    import random
    from datetime import datetime, timedelta
    
    for i in range(12):
        date = datetime.now() - timedelta(days=(11 - i) * 30)
        trends["tasksCompleted"].append({
            "date": date.isoformat(),
            "value": max(0, int(base_tasks * (0.7 + random.random() * 0.6))),
        })
        trends["ratings"].append({
            "date": date.isoformat(),
            "value": round(base_rating * (0.8 + random.random() * 0.4), 1),
        })
        trends["slaReliability"].append({
            "date": date.isoformat(),
            "value": max(0, min(100, int(base_sla * (0.9 + random.random() * 0.2)))),
        })
    
    return trends


def calculate_task_achiever_progress(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate TaskAchiever eligibility progress."""
    metrics = profile_data.get("metrics", {})
    criteria = profile_data.get("taskAchieverCriteria", {})
    
    return {
        "tasksCompleted": {
            "current": metrics.get("tasksCompleted", 0),
            "required": criteria.get("minimumTasksCompleted", 10),
        },
        "rating": {
            "current": metrics.get("averageRating", 0.0),
            "required": criteria.get("minimumRating", 4.5),
        },
        "slaReliability": {
            "current": metrics.get("slaReliability", 0),
            "required": criteria.get("minimumSlaReliability", 95),
        },
        "completionRate": {
            "current": profile_data.get("completionPercentage", 0),
            "required": 90,
        },
    }
