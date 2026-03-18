export default function CategoryCard({
  title,
  description,
  image,
  buttonLabel,
  styles,
  setSelectedCategory = () => {},
}) {
  return (
    <div style={styles.categoryCard} className="category-card">
      <div style={styles.categoryImageWrap} className="category-image-wrap">
        <img
          src={image}
          alt={title}
          style={styles.categoryImage}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
      <div style={styles.categoryContent}>
        <h3 style={styles.categoryName}>{title}</h3>
        {description && (
          <p style={styles.categoryDescription}>{description}</p>
        )}
        <button style={styles.categoryButton} onClick={() => setSelectedCategory(title)}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

