import { getUploadFileMutationOptions } from '@/api-clients/admin-api-client/mutations';
import { getApiErrorMessage } from '@/lib/utils';
import { Editor } from '@tinymce/tinymce-react';
import { useTheme } from 'next-themes';

import { ComponentProps } from 'react';

export default function RichTextEditor({
  editor,
}: {
  editor?: ComponentProps<typeof Editor>;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <Editor
      key={resolvedTheme}
      {...editor}
      apiKey="zrr09ljmv9jnole64omsrqely889fbdkfl2ma89u2jde6z6t"
      init={{
        plugins:
          'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
        menubar: 'file edit view insert format tools table help',
        toolbar:
          'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl | accordion accordionremove',
        quickbars_selection_toolbar:
          'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        content_style: 'body { font-family:Inter; font-size:14px }',
        skin: resolvedTheme === 'dark' ? 'oxide-dark' : 'oxide',
        content_css: resolvedTheme === 'dark' ? 'dark' : 'light',
        autosave_interval: '5s',
        // autosave_prefix: '{path}{query}-{id}-',
        // autosave_restore_when_empty: false,
        // autosave_retention: '2m',
        image_advtab: true,
        height: 400,
        image_caption: true,
        autosave_ask_before_unload: true,
        ...editor?.init,
        // images_upload_url: envs.ADMIN_API_BASE_URL + '/upload',
        // images_upload_credentials: true,
        async images_upload_handler(blobInfo, progress) {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob());

            getUploadFileMutationOptions({
              axiosConfig: {
                onUploadProgress: (progressEvent) => {
                  progress(
                    Number(((progressEvent.progress ?? 0) * 100).toFixed(0))
                  );
                },
              },
            })
              .mutationFn({
                data: formData,
              })
              .then((res) => {
                resolve(res.data.data.location);
              })
              .catch((error) => {
                reject(getApiErrorMessage(error));
              });
          });
        },
      }}
    />
  );
}
