from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///projects.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Database Model
class Track_projects(db.Model):
    __tablename__ = "track_projects"
    project_id = Column(Integer(), primary_key=True, nullable=False)
    project_name = Column(String(100), nullable=False)
    project_description = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="Not Started")
    created_at = Column(DateTime(), nullable=False, default=datetime.now)

    def __init__(self, project_name, project_description, status="Not Started"):
        self.project_name = project_name
        self.project_description = project_description
        self.status = status

    def to_dict(self):
        """Convert project to dictionary for JSON responses"""
        return {
            'id': self.project_id,
            'name': self.project_name,
            'description': self.project_description,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }

    def __str__(self):
        return f"Project(id={self.project_id}, name={self.project_name}, status={self.status})"

# ============ WEB ROUTES (HTML Pages) ============

@app.route('/')
def index():
    """Main page - display all projects"""
    projects = Track_projects.query.all()
    return render_template('index.html', projects=projects)

@app.route('/add', methods=['GET', 'POST'])
def add_project():
    """Add new project page"""
    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        status = request.form['status']
        
        new_project = Track_projects(name, description, status)
        db.session.add(new_project)
        db.session.commit()
        
        return redirect(url_for('index'))
    
    return render_template('add_project.html')

@app.route('/edit/<int:project_id>', methods=['GET', 'POST'])
def edit_project(project_id):
    """Edit project page"""
    project = Track_projects.query.get_or_404(project_id)
    
    if request.method == 'POST':
        project.project_name = request.form['name']
        project.project_description = request.form['description']
        project.status = request.form['status']
        db.session.commit()
        return redirect(url_for('index'))
    
    return render_template('edit_project.html', project=project)

@app.route('/delete/<int:project_id>')
def delete_project(project_id):
    """Delete a project"""
    project = Track_projects.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return redirect(url_for('index'))

# ============ API ROUTES (JSON Responses) ============

@app.route('/api/projects')
def api_projects():
    """API endpoint to get all projects as JSON"""
    projects = Track_projects.query.all()
    return jsonify([project.to_dict() for project in projects])

@app.route('/api/projects', methods=['POST'])
def api_add_project():
    """API endpoint to add a project via JSON"""
    data = request.get_json()
    new_project = Track_projects(
        data['name'], 
        data.get('description', ''), 
        data.get('status', 'Not Started')
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.to_dict()), 201

# ============ INITIALIZE DATABASE ============

def init_db():
    """Initialize database with sample data"""
    with app.app_context():
        db.create_all()
        
        # Add sample data if table is empty
        if Track_projects.query.count() == 0:
            sample_projects = []
            for project in sample_projects:
                db.session.add(project)
            
            db.session.commit()
            print("✅ Database initialized with sample data!")

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
