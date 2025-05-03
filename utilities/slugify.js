const slugify = (text, options = {}) => {
  const { lower = true, strict = false } = options;

  let slug = text.toString().trim();

  if (lower) {
    slug = slug.toLowerCase();
  }

  if (strict) {
    slug = slug.replace(/[^\w\s-]/g, ""); // Remove special characters except spaces and dashes
  }

  return slug
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with dashes
    .replace(/\-\-+/g, "-") // Replace multiple dashes with a single dash
    .replace(/^-+|-+$/g, ""); // Trim dashes from the start and end
};

export default slugify;
