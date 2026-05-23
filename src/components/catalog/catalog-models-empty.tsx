"use client";

export function CatalogModelsEmpty({ categoryName }: { categoryName: string }) {
  return (
    <div className="border-b border-border/60 px-4 py-4">
      <p className="text-sm font-medium text-foreground">No models available</p>
      <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
        {categoryName} has no active models. In Django admin, check{" "}
        <strong className="text-foreground">AI Models</strong> (is_active) or run{" "}
        <code className="rounded bg-secondary px-1 py-0.5 text-xs">python manage.py seed_catalog</code>{" "}
        on the server.
      </p>
    </div>
  );
}
