"use client"

const avatarImages = [
  { file: 'party.png', label: 'Party' },
  { file: 'programmer.png', label: 'Programmer' },
  { file: 'student.png', label: 'Student' },
  { file: 'wizard.png', label: 'Wizard' },
];

export default function AvatarSelector({
  currentAvatar,
  onSelect,
}: {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 place-items-center">
      {avatarImages.map(({ file, label }) => {
        const isSelected = currentAvatar.includes(file);
        return (
          <div key={file} className="flex flex-col items-center">
            <img
              src={`/avatars/${file}`}
              alt={label}
              className={`w-20 h-20 rounded-full cursor-pointer border-4 transition ${
                isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => onSelect(`/avatars/${file}`)}
            />
            <span className="mt-1 text-sm font-medium text-gray-700">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
