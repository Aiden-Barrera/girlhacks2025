function Node() {
    const levelTitle = "Beginner-1";
    const skill = "Skill2";
    return (
        <header>
            <h4 className="nodes">
                <h2>{levelTitle}</h2>
                <p>Your skills can be found below:</p>
                <li className="nodeSkills">Apple</li>
                <li className="nodeSkills">{skill}</li>
            </h4>
            
        </header>
    );
}
export default Node