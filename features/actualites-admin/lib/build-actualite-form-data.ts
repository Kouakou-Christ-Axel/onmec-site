export interface ActualiteFormFields {
  title: string;
  excerpt: string;
  content: string;
  date: string;
}

export function buildActualiteFormData(
  fields: ActualiteFormFields,
  categorieId: string,
  image: File | null,
): FormData {
  const formData = new FormData();
  formData.set("title", fields.title);
  formData.set("excerpt", fields.excerpt);
  formData.set("content", fields.content);
  formData.set("date", fields.date);
  formData.set("categorieId", categorieId);
  if (image) {
    formData.set("image", image);
  }
  return formData;
}
